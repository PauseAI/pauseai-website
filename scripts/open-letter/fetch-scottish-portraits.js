#!/usr/bin/env node

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Scottish MSPs with their Wikipedia portrait URLs
const scottishMSPs = [
	{
		name: 'Clare Adamson',
		url: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Clare_Adamson_MSP.jpg'
	},
	{
		name: 'Miles Briggs',
		url: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/MilesBriggsMSP.jpg'
	},
	{
		name: 'Ariane Burgess',
		url: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Ariane_Burgess_MSP.jpg'
	},
	{
		name: 'Finlay Carson',
		url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Finlay_Carson_MSP.jpg'
	},
	{
		name: 'Alex Cole-Hamilton',
		url: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Alex_Cole-Hamilton_MSP.jpg'
	},
	{
		name: 'Bill Kidd',
		url: 'https://upload.wikimedia.org/wikipedia/commons/8/80/BillKiddMSP20070509.jpg'
	},
	{
		name: 'Stuart McMillan',
		url: 'https://upload.wikimedia.org/wikipedia/commons/a/af/StuartMcMillanMSP20110510.JPG'
	},
	{
		name: 'Willie Rennie',
		url: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Official_Portrait_of_Willie_Rennie_MSP.jpg'
	},
	{
		name: 'Michelle Thomson',
		url: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Michelle_Thomson_2021.jpg'
	},
	{
		name: 'Elena Whitham',
		url: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Official_2023_government_portrait_of_Elena_Whitham.jpg'
	}
]

// Function to download image
function downloadImage(/** @type {string} */ url, /** @type {string} */ filepath) {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(filepath)
		let downloadedSize = 0

		const options = {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
			}
		}

		https
			.get(url, options, (response) => {
				if (response.statusCode !== 200) {
					file.close()
					fs.unlink(filepath, () => {})
					reject(new Error(`HTTP ${response.statusCode}`))
					return
				}

				response.on('data', (chunk) => {
					downloadedSize += chunk.length
				})

				response.pipe(file)

				file.on('finish', () => {
					file.close()
					resolve(downloadedSize)
				})
			})
			.on('error', (err) => {
				fs.unlink(filepath, () => {})
				reject(err)
			})
	})
}

// Function to sanitize filename
function sanitizeFilename(/** @type {string} */ name) {
	return name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}

async function main() {
	// Create portraits directory if it doesn't exist
	const portraitsDir = path.join(
		path.dirname(__dirname),
		'static',
		'portraits',
		'signatories',
		'scotland'
	)
	if (!fs.existsSync(portraitsDir)) {
		fs.mkdirSync(portraitsDir, { recursive: true })
	}

	console.log('Fetching Scottish MSP portraits from Wikipedia...')
	console.log(`Saving to: ${portraitsDir}\n`)

	const results = []
	let successCount = 0
	let errorCount = 0

	for (const member of scottishMSPs) {
		process.stdout.write(`Downloading ${member.name}... `)

		const filename = sanitizeFilename(member.name) + '.jpg'
		const filepath = path.join(portraitsDir, filename)

		try {
			const size = await downloadImage(member.url, filepath)
			const sizeKB = Math.round(size / 1024)
			const sizeMB = (size / (1024 * 1024)).toFixed(1)

			results.push({
				name: member.name,
				portrait: `/portraits/signatories/scotland/${filename}`,
				fileSize: size,
				source: 'wikipedia',
				status: 'success'
			})

			// Show KB or MB depending on size
			const sizeStr = size > 1024 * 1024 ? `${sizeMB}MB` : `${sizeKB}KB`
			console.log(`✓ Downloaded (${sizeStr})`)
			successCount++
		} catch (error) {
			console.log(`✗ Error: ${error instanceof Error ? error.message : String(error)}`)
			results.push({
				name: member.name,
				portrait: null,
				status: 'error',
				error: error instanceof Error ? error.message : String(error)
			})
			errorCount++
		}

		// Small delay to be polite to Wikipedia servers
		await new Promise((resolve) => setTimeout(resolve, 300))
	}

	// Update the main signatories JSON file
	const mainJsonPath = path.join(path.dirname(portraitsDir), 'signatories-square.json')
	if (fs.existsSync(mainJsonPath)) {
		const mainData = JSON.parse(fs.readFileSync(mainJsonPath, 'utf8'))

		// Update Scottish MSP entries
		for (const result of results) {
			const index = mainData.findIndex((/** @type {any} */ s) => s.name === result.name)
			if (index !== -1) {
				mainData[index] = {
					...mainData[index],
					...result,
					chamber: 'scotland',
					type: 'MSP',
					status: result.status
				}
			}
		}

		fs.writeFileSync(mainJsonPath, JSON.stringify(mainData, null, 2))
		console.log(`\nUpdated main signatories file: ${mainJsonPath}`)
	}

	console.log('\n' + '='.repeat(50))
	console.log('Summary:')
	console.log(`Total Scottish MSPs: ${scottishMSPs.length}`)
	console.log(`✓ Successful downloads: ${successCount}`)
	console.log(`✗ Errors: ${errorCount}`)
}

// Run the script
main().catch(console.error)
