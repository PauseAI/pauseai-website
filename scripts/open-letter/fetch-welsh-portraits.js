#!/usr/bin/env node

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Welsh MSs with their portrait URLs
const welshMSs = [
	{
		name: 'Luke Fletcher',
		url: 'https://senedd.wales/media/j5smb04a/luke-fletcher.jpg'
	},
	{
		name: 'Heledd Fychan',
		url: 'https://senedd.wales/media/jqeb1lwh/heledd-fychan.jpg'
	},
	{
		name: 'Mike Hedges',
		url: 'https://senedd.wales/media/uf1p312u/mike-hedges.jpg'
	},
	{
		name: 'Jenny Rathbone',
		url: 'https://senedd.wales/media/mgfgwtzs/jenny-rathbone.jpg'
	},
	{
		name: 'Carolyn Thomas',
		url: 'https://senedd.wales/media/asmdke4m/carolyn-thomas.jpg'
	},
	{
		name: 'Lee Waters',
		url: 'https://senedd.wales/media/sn4ltl4t/lee-waters.jpg'
	}
]

// Function to download image
function downloadImage(url, filepath) {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(filepath)
		let downloadedSize = 0

		https
			.get(url, (response) => {
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
function sanitizeFilename(name) {
	return name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}

async function main() {
	// Create portraits directory if it doesn't exist
	const portraitsDir = path.join(path.dirname(__dirname), 'static', 'portraits', 'signatories')
	if (!fs.existsSync(portraitsDir)) {
		fs.mkdirSync(portraitsDir, { recursive: true })
	}

	console.log('Fetching Welsh Senedd MS portraits...')
	console.log(`Saving to: ${portraitsDir}\n`)

	const results = []
	let successCount = 0
	let errorCount = 0

	for (const member of welshMSs) {
		process.stdout.write(`Downloading ${member.name}... `)

		const filename = sanitizeFilename(member.name) + '.jpg'
		const filepath = path.join(portraitsDir, filename)

		try {
			const size = await downloadImage(member.url, filepath)
			const sizeKB = Math.round(size / 1024)
			const sizeMB = (size / (1024 * 1024)).toFixed(1)

			results.push({
				name: member.name,
				portrait: `/portraits/signatories/${filename}`,
				fileSize: size,
				status: 'success'
			})

			// Show KB or MB depending on size
			const sizeStr = size > 1024 * 1024 ? `${sizeMB}MB` : `${sizeKB}KB`
			console.log(`✓ Downloaded (${sizeStr})`)
			successCount++
		} catch (error) {
			console.log(`✗ Error: ${error.message}`)
			results.push({
				name: member.name,
				portrait: null,
				status: 'error',
				error: error.message
			})
			errorCount++
		}

		// Small delay to be polite to the server
		await new Promise((resolve) => setTimeout(resolve, 200))
	}

	// Update the main signatories JSON file
	const mainJsonPath = path.join(portraitsDir, 'signatories-square.json')
	if (fs.existsSync(mainJsonPath)) {
		const mainData = JSON.parse(fs.readFileSync(mainJsonPath, 'utf8'))

		// Update Welsh MS entries
		for (const result of results) {
			const index = mainData.findIndex((s) => s.name === result.name)
			if (index !== -1) {
				mainData[index] = {
					...mainData[index],
					...result,
					chamber: 'wales',
					type: 'MS',
					status: result.status
				}
			}
		}

		fs.writeFileSync(mainJsonPath, JSON.stringify(mainData, null, 2))
		console.log(`\nUpdated main signatories file: ${mainJsonPath}`)
	}

	console.log('\n' + '='.repeat(50))
	console.log('Summary:')
	console.log(`Total Welsh MSs: ${welshMSs.length}`)
	console.log(`✓ Successful downloads: ${successCount}`)
	console.log(`✗ Errors: ${errorCount}`)
}

// Run the script
main().catch(console.error)
