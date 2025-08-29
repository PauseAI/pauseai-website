#!/usr/bin/env node

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// List of signatories from the open letter
const signatories = [
	// MPs
	{ name: 'Dr Rosena Allin-Khan', chamber: 'commons', type: 'MP' },
	{ name: 'Siân Berry', chamber: 'commons', type: 'MP' },
	{ name: 'Ellie Chowns', chamber: 'commons', type: 'MP' },
	{ name: 'Ann Davies', chamber: 'commons', type: 'MP' },
	{ name: 'Carla Denyer', chamber: 'commons', type: 'MP' },
	{ name: 'Ben Lake', chamber: 'commons', type: 'MP' },
	{ name: 'Llinos Medi', chamber: 'commons', type: 'MP' },
	{ name: 'Iqbal Mohamed', chamber: 'commons', type: 'MP' },
	{ name: 'Yasmin Qureshi', chamber: 'commons', type: 'MP' },
	{ name: 'Adrian Ramsay', chamber: 'commons', type: 'MP' },
	{ name: 'Liz Saville Roberts', chamber: 'commons', type: 'MP' },
	{ name: 'Sir Desmond Swayne', chamber: 'commons', type: 'MP' },

	// Lords and Baronesses
	{ name: 'Lord Browne of Ladyton', chamber: 'lords', type: 'Lord' },
	{ name: 'Lord Campbell-Savours', chamber: 'lords', type: 'Lord' },
	{ name: 'Lord Cashman', chamber: 'lords', type: 'Lord' },
	{ name: 'Baroness Chakrabarti', chamber: 'lords', type: 'Baroness' },
	{ name: 'Viscount Colville of Culross', chamber: 'lords', type: 'Lord' },
	{ name: "Baroness D'Souza", chamber: 'lords', type: 'Baroness' },
	{ name: 'Baroness Featherstone', chamber: 'lords', type: 'Baroness' },
	{ name: 'Baroness Foster of Aghadrumsee', chamber: 'lords', type: 'Baroness' },
	{ name: 'Baroness Harris of Richmond', chamber: 'lords', type: 'Baroness' },
	{ name: 'Baroness Kennedy of The Shaws', chamber: 'lords', type: 'Baroness' },
	{ name: 'Baroness Kidron', chamber: 'lords', type: 'Baroness' },
	{ name: 'Lord Knight of Weymouth', chamber: 'lords', type: 'Lord' },
	{ name: 'The Lord Bishop of Leeds', chamber: 'lords', type: 'Bishop' },
	{ name: 'Lord McNally', chamber: 'lords', type: 'Lord' },
	{ name: 'Baroness Miller of Chilthorne Domer', chamber: 'lords', type: 'Baroness' },
	{ name: 'Baroness Morris of Yardley', chamber: 'lords', type: 'Baroness' },
	{ name: 'The Lord Bishop of Oxford', chamber: 'lords', type: 'Bishop' },
	{ name: 'Baroness Prashar', chamber: 'lords', type: 'Baroness' },
	{ name: 'Baroness Ritchie of Downpatrick', chamber: 'lords', type: 'Baroness' },
	{ name: 'Lord Singh of Wimbledon', chamber: 'lords', type: 'Lord' },
	{ name: 'Lord Strasburger', chamber: 'lords', type: 'Lord' },
	{ name: 'Baroness Uddin', chamber: 'lords', type: 'Baroness' },

	// MSPs (Members of Scottish Parliament)
	{ name: 'Clare Adamson', chamber: 'scotland', type: 'MSP' },
	{ name: 'Miles Briggs', chamber: 'scotland', type: 'MSP' },
	{ name: 'Ariane Burgess', chamber: 'scotland', type: 'MSP' },
	{ name: 'Finlay Carson', chamber: 'scotland', type: 'MSP' },
	{ name: 'Alex Cole-Hamilton', chamber: 'scotland', type: 'MSP' },
	{ name: 'Bill Kidd', chamber: 'scotland', type: 'MSP' },
	{ name: 'Stuart McMillan', chamber: 'scotland', type: 'MSP' },
	{ name: 'Willie Rennie', chamber: 'scotland', type: 'MSP' },
	{ name: 'Michelle Thomson', chamber: 'scotland', type: 'MSP' },
	{ name: 'Elena Whitham', chamber: 'scotland', type: 'MSP' },

	// MLAs (Members of Northern Ireland Assembly)
	{ name: 'Doug Beattie MC', chamber: 'ni', type: 'MLA' },
	{ name: 'Keith Buchanan', chamber: 'ni', type: 'MLA' },
	{ name: 'Gerry Carroll', chamber: 'ni', type: 'MLA' },
	{ name: 'Stewart Dickson', chamber: 'ni', type: 'MLA' },
	{ name: 'Connie Egan', chamber: 'ni', type: 'MLA' },
	{ name: 'Deborah Erskine', chamber: 'ni', type: 'MLA' },
	{ name: 'Harry Harvey', chamber: 'ni', type: 'MLA' },
	{ name: 'Naomi Long', chamber: 'ni', type: 'MLA' },
	{ name: 'Peter Martin', chamber: 'ni', type: 'MLA' },
	{ name: 'Sinéad McLaughlin', chamber: 'ni', type: 'MLA' },

	// MSs (Members of Welsh Senedd)
	{ name: 'Luke Fletcher', chamber: 'wales', type: 'MS' },
	{ name: 'Heledd Fychan', chamber: 'wales', type: 'MS' },
	{ name: 'Mike Hedges', chamber: 'wales', type: 'MS' },
	{ name: 'Jenny Rathbone', chamber: 'wales', type: 'MS' },
	{ name: 'Carolyn Thomas', chamber: 'wales', type: 'MS' },
	{ name: 'Lee Waters', chamber: 'wales', type: 'MS' },

	// Organizations
	{ name: 'PauseAI Global', chamber: 'org', type: 'Organization' },
	{ name: 'Open Rights Group', chamber: 'org', type: 'Organization' },
	{ name: 'Connected by Data', chamber: 'org', type: 'Organization' },
	{ name: 'Open Data Manchester', chamber: 'org', type: 'Organization' },
	{ name: 'Safe AI for Children Alliance', chamber: 'org', type: 'Organization' }
]

// Function to check image size before downloading
function checkImageSize(url) {
	return new Promise((resolve) => {
		https
			.get(url, (res) => {
				const size = parseInt(res.headers['content-length'] || '0')
				res.destroy() // Don't download, just check headers
				resolve({ exists: res.statusCode === 200, size })
			})
			.on('error', () => {
				resolve({ exists: false, size: 0 })
			})
	})
}

// Function to download image with better error handling
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
					// Check if the image is just a placeholder (very small)
					if (downloadedSize < 5000) {
						// Less than 5KB is likely a placeholder
						fs.unlink(filepath, () => {})
						reject(new Error('Image too small - likely placeholder'))
					} else {
						resolve(downloadedSize)
					}
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
	return name
		.replace(/^(The Lord Bishop of |Lord |Lady |Baroness |Sir |Dr |Viscount )/i, '')
		.replace(/ of .+$/, '')
		.replace(/ MC$/, '')
		.replace(/[^a-z0-9]/gi, '_')
		.toLowerCase()
}

// Function to fetch member data from Parliament API
function fetchMemberData(name, chamber) {
	return new Promise((resolve, reject) => {
		const house = chamber === 'lords' ? '2' : '1'
		const searchUrl = `https://members-api.parliament.uk/api/Members/Search?Name=${encodeURIComponent(name)}&House=${house}&skip=0&take=1`

		https
			.get(searchUrl, (res) => {
				let data = ''
				res.on('data', (chunk) => (data += chunk))
				res.on('end', () => {
					try {
						const json = JSON.parse(data)
						resolve(json)
					} catch (e) {
						reject(e)
					}
				})
			})
			.on('error', reject)
	})
}

// Main function
async function main() {
	// Create portraits directory if it doesn't exist
	const portraitsDir = path.join(path.dirname(__dirname), 'static', 'portraits', 'signatories')
	if (!fs.existsSync(portraitsDir)) {
		fs.mkdirSync(portraitsDir, { recursive: true })
	}

	console.log('Fetching SQUARE parliamentarian portraits...')
	console.log(`Saving to: ${portraitsDir}\n`)

	const results = []
	let successCount = 0
	let skipCount = 0
	let errorCount = 0
	let noPortraitCount = 0

	for (const signatory of signatories) {
		process.stdout.write(`Processing ${signatory.name}... `)

		if (signatory.chamber === 'org') {
			// Skip organizations
			results.push({
				name: signatory.name,
				type: signatory.type,
				portrait: null,
				status: 'organization'
			})
			console.log('SKIP (organization)')
			skipCount++
			continue
		}

		if (signatory.chamber === 'commons' || signatory.chamber === 'lords') {
			try {
				// Fetch member data from Parliament API
				const memberData = await fetchMemberData(signatory.name, signatory.chamber)

				if (memberData.items && memberData.items.length > 0) {
					const member = memberData.items[0].value
					const memberId = member.id

					// Try square portrait options in order of preference
					const squareUrls = [
						{
							url: `https://members-api.parliament.uk/api/Members/${memberId}/Portrait?cropType=OneOne&webVersion=false`,
							type: 'square-highres'
						},
						{
							url: `https://members-api.parliament.uk/api/Members/${memberId}/Portrait?CropType=OneOne`,
							type: 'square-crop'
						},
						{
							url: `https://members-api.parliament.uk/api/Members/${memberId}/Thumbnail`,
							type: 'thumbnail'
						}
					]

					let downloaded = false

					for (const option of squareUrls) {
						const check = await checkImageSize(option.url)

						if (check.exists && check.size > 5000) {
							const filename = sanitizeFilename(signatory.name) + '.jpg'
							const filepath = path.join(portraitsDir, filename)

							try {
								const size = await downloadImage(option.url, filepath)

								results.push({
									name: signatory.name,
									displayName: member.nameDisplayAs,
									type: signatory.type,
									portrait: `/portraits/signatories/${filename}`,
									memberId: member.id,
									party: member.latestParty?.name,
									format: 'square',
									source: option.type,
									fileSize: size,
									status: 'success'
								})

								const sizeKB = Math.round(size / 1024)
								console.log(`✓ Downloaded (square ${option.type}, ${sizeKB}KB)`)
								successCount++
								downloaded = true
								break
							} catch {
								// Try next option
								continue
							}
						}
					}

					if (!downloaded) {
						results.push({
							name: signatory.name,
							displayName: member.nameDisplayAs,
							type: signatory.type,
							portrait: null,
							memberId: member.id,
							status: 'no_real_portrait',
							reason: 'No square portrait available'
						})
						console.log('⚠ No real portrait (placeholder only)')
						noPortraitCount++
					}
				} else {
					results.push({
						name: signatory.name,
						type: signatory.type,
						portrait: null,
						status: 'not_found'
					})
					console.log('⚠ Member not found')
					errorCount++
				}

				// Add small delay to avoid rate limiting
				await new Promise((resolve) => setTimeout(resolve, 200))
			} catch (error) {
				console.log(`✗ Error: ${error.message}`)
				results.push({
					name: signatory.name,
					type: signatory.type,
					portrait: null,
					status: 'error',
					error: error.message
				})
				errorCount++
			}
		} else {
			// For Scottish, Welsh, and NI parliamentarians
			results.push({
				name: signatory.name,
				type: signatory.type,
				portrait: null,
				status: 'needs_manual',
				chamber: signatory.chamber
			})
			console.log(`⚠ Needs manual fetch (${signatory.chamber})`)
			skipCount++
		}
	}

	// Save results to JSON file
	const resultsPath = path.join(portraitsDir, 'signatories-square.json')
	fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2))

	console.log('\n' + '='.repeat(50))
	console.log('Summary:')
	console.log(`Total signatories: ${results.length}`)
	console.log(`✓ Successful downloads: ${successCount}`)
	console.log(`⚠ No real portrait: ${noPortraitCount}`)
	console.log(`⚠ Needs manual fetch: ${skipCount - 5}`) // Subtract organizations
	console.log(`⚠ Organizations: 5`)
	console.log(`✗ Errors: ${errorCount}`)
	console.log(`\nResults saved to: ${resultsPath}`)
	console.log(`Portraits saved to: ${portraitsDir}`)

	// Show who has no portraits
	const noPortraits = results.filter(
		(r) => r.status === 'no_real_portrait' || (r.status === 'no_portrait' && r.memberId)
	)
	if (noPortraits.length > 0) {
		console.log('\nMembers without real portraits:')
		noPortraits.forEach((m) => console.log(`  - ${m.name || m.displayName}`))
	}
}

// Run the script
main().catch(console.error)
