#!/usr/bin/env node
/**
 * Send one-off notification emails to users featured in the preliminary collage
 *
 * Usage:
 *   pnpm tsx scripts/send-collage-notifications.ts --dry-run
 *   pnpm tsx scripts/send-collage-notifications.ts --test <email>
 *   pnpm tsx scripts/send-collage-notifications.ts --send
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import * as nodemailer from 'nodemailer'
import { createInterface } from 'readline'

const SENDER_EMAIL = 'anthony@pauseai.info'
const SENDER_NAME = 'Anthony Bailey (PauseAI)'
const COLLAGE_PAGE_URL =
	'https://pauseai.info/if-anyone-builds-it-campaign#say-no-to-superintelligent-ai'
const COLLAGE_IMAGE_URL = 'https://pauseai.info/collages/manual_bootstrap.jpg'

const EMAIL_SUBJECT =
	'Your photo is in the collage for press release that bootstraps the "sayno" campaign.'

const EMAIL_BODY = `Hi there,

Recently, you uploaded your photo to Pause AI's "Say No to Superintelligent AI" campaign. We promised to tell you the first time you were in a collage.

I'm a developer on the campaign. Well, you are in the prototype collage (currently on ${COLLAGE_PAGE_URL} and permanently at ${COLLAGE_IMAGE_URL}) that is linked from our initial press release, so I wanted to keep the promise and tell you that straight away!

This was just a bootstrap version to get things started. We're still working on our proper automated notification pipeline. You can expect one more email from us when that's ready, with more information and options. To be clear: you're not on any permanent mailing list, this is just me properly keeping my promise to notify you.

Thanks,

--Anthony.`

interface SendStats {
	total: number
	sent: number
	failed: number
	skipped: number
	failedAddresses: string[]
}

async function prompt(question: string): Promise<string> {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout
	})

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close()
			resolve(answer)
		})
	})
}

async function createTransporter() {
	// Check for credentials in environment
	const password = process.env.GMAIL_APP_PASSWORD

	if (!password) {
		console.error('\n❌ Error: GMAIL_APP_PASSWORD environment variable not set')
		console.error('\nTo set up Gmail authentication:')
		console.error('1. Go to https://myaccount.google.com/apppasswords')
		console.error('2. Generate an app password (e.g., app name: sayno_temporary_mail)')
		console.error('3. Set it in your environment:')
		console.error('   export GMAIL_APP_PASSWORD="your-16-char-password"')
		process.exit(1)
	}

	return nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 587,
		secure: false, // STARTTLS
		auth: {
			user: SENDER_EMAIL,
			pass: password
		}
	})
}

function loadRecipients(): string[] {
	const cachePath = join(process.cwd(), 'sayno-emails-cache.json')

	if (!existsSync(cachePath)) {
		console.error(`❌ Error: Cache file not found at ${cachePath}`)
		console.error('Run fetch-sayno-emails.ts first to generate the cache.')
		process.exit(1)
	}

	const cache = JSON.parse(readFileSync(cachePath, 'utf-8'))
	const emails = cache.records
		.filter((r: { email: string | null }) => r.email)
		.map((r: { email: string }) => r.email)

	return emails
}

function initLogFile(): string {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
	const logFile = join(process.cwd(), `logs/collage-notifications-${timestamp}.log`)

	// Ensure logs directory exists
	mkdirSync(join(process.cwd(), 'logs'), { recursive: true })

	const header = `Collage Notification Send Log
Started: ${new Date().toISOString()}
Sender: ${SENDER_EMAIL}
Subject: ${EMAIL_SUBJECT}
=====================================

`
	writeFileSync(logFile, header)
	return logFile
}

function log(logFile: string, message: string) {
	const timestamp = new Date().toISOString()
	const line = `[${timestamp}] ${message}\n`
	appendFileSync(logFile, line)
	console.log(message)
}

async function sendEmail(
	transporter: nodemailer.Transporter,
	to: string,
	logFile: string
): Promise<boolean> {
	try {
		const info = await transporter.sendMail({
			from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
			to: to,
			subject: EMAIL_SUBJECT,
			text: EMAIL_BODY
		})

		log(logFile, `✓ Sent to ${to} (Message ID: ${info.messageId})`)
		return true
	} catch (error) {
		log(logFile, `✗ Failed to send to ${to}: ${error}`)
		return false
	}
}

async function dryRun() {
	console.log('🔍 DRY RUN MODE\n')
	console.log('Email Configuration:')
	console.log(`  From: "${SENDER_NAME}" <${SENDER_EMAIL}>`)
	console.log(`  Subject: ${EMAIL_SUBJECT}`)
	console.log(`\nEmail Body:\n${'='.repeat(70)}`)
	console.log(EMAIL_BODY)
	console.log('='.repeat(70))

	const recipients = loadRecipients()
	console.log(`\n📧 Would send to ${recipients.length} recipients:`)
	console.log(`\nFirst 5 recipients:`)
	recipients.slice(0, 5).forEach((email) => console.log(`  - ${email}`))
	console.log(`  ... and ${recipients.length - 5} more`)
	console.log(`\nLast 5 recipients:`)
	recipients.slice(-5).forEach((email) => console.log(`  - ${email}`))

	console.log(`\n✓ Dry run complete. No emails were sent.`)
}

async function testSend(testEmail: string) {
	console.log(`🧪 TEST MODE - Sending to ${testEmail}\n`)

	const transporter = await createTransporter()
	const logFile = initLogFile()

	log(logFile, `TEST SEND to ${testEmail}`)

	const success = await sendEmail(transporter, testEmail, logFile)

	if (success) {
		console.log(`\n✓ Test email sent successfully!`)
		console.log(`Check ${testEmail} to verify the email looks correct.`)
	} else {
		console.log(`\n✗ Test email failed. Check the log file: ${logFile}`)
		process.exit(1)
	}
}

async function realSend() {
	const recipients = loadRecipients()

	console.log(`📧 PRODUCTION MODE - Sending to ${recipients.length} recipients\n`)
	console.log('⚠️  WARNING: This will send real emails!')
	console.log(`From: ${SENDER_EMAIL}`)
	console.log(`To: ${recipients.length} addresses`)
	console.log(`Subject: ${EMAIL_SUBJECT}\n`)

	const answer = await prompt('Type "SEND" (in capitals) to proceed: ')

	if (answer !== 'SEND') {
		console.log('\n❌ Send cancelled.')
		process.exit(0)
	}

	console.log('\n🚀 Starting send...\n')

	const transporter = await createTransporter()
	const logFile = initLogFile()

	const stats: SendStats = {
		total: recipients.length,
		sent: 0,
		failed: 0,
		skipped: 0,
		failedAddresses: []
	}

	log(logFile, `PRODUCTION SEND started - ${recipients.length} recipients`)

	for (let i = 0; i < recipients.length; i++) {
		const email = recipients[i]
		const progress = `[${i + 1}/${recipients.length}]`

		process.stdout.write(`${progress} Sending to ${email}... `)

		const success = await sendEmail(transporter, email, logFile)

		if (success) {
			stats.sent++
			console.log('✓')
		} else {
			stats.failed++
			stats.failedAddresses.push(email)
			console.log('✗')
		}

		// Rate limiting: Gmail allows ~500 emails/day, let's be conservative
		// Wait 2 seconds between emails (allows ~1800/hour, well under limit)
		if (i < recipients.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, 2000))
		}
	}

	// Final summary
	console.log('\n' + '='.repeat(70))
	console.log('Send Complete!')
	console.log('='.repeat(70))
	console.log(`Total recipients: ${stats.total}`)
	console.log(`✓ Successfully sent: ${stats.sent}`)
	console.log(`✗ Failed: ${stats.failed}`)

	if (stats.failed > 0) {
		console.log(`\nFailed addresses:`)
		stats.failedAddresses.forEach((email) => console.log(`  - ${email}`))
	}

	console.log(`\nLog file: ${logFile}`)

	log(logFile, `\nFINAL STATS: ${stats.sent} sent, ${stats.failed} failed`)
}

async function main() {
	const args = process.argv.slice(2)

	if (args.length === 0 || args[0] === '--help') {
		console.log(`
Collage Notification Email Sender

Usage:
  pnpm tsx scripts/send-collage-notifications.ts --dry-run
    Show what would be sent without actually sending

  pnpm tsx scripts/send-collage-notifications.ts --test <email>
    Send a test email to the specified address

  pnpm tsx scripts/send-collage-notifications.ts --send
    Send emails to all 142 recipients (requires confirmation)

Prerequisites:
  Set GMAIL_APP_PASSWORD environment variable with a Gmail app password
  (Generate at https://myaccount.google.com/apppasswords)
`)
		process.exit(0)
	}

	const mode = args[0]

	switch (mode) {
		case '--dry-run':
			await dryRun()
			break

		case '--test':
			if (!args[1]) {
				console.error('❌ Error: --test requires an email address')
				console.error('Usage: pnpm tsx scripts/send-collage-notifications.ts --test <email>')
				process.exit(1)
			}
			await testSend(args[1])
			break

		case '--send':
			await realSend()
			break

		default:
			console.error(`❌ Unknown mode: ${mode}`)
			console.error('Use --help to see available options')
			process.exit(1)
	}
}

main().catch((error) => {
	console.error('Fatal error:', error)
	process.exit(1)
})
