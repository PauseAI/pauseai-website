#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import https from 'https'

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
	{ name: 'Lord McNally', chamber: 'lords', type: 'Lord' },
	{ name: 'Baroness Miller of Chilthorne Domer', chamber: 'lords', type: 'Baroness' },
	{ name: 'Baroness Morris of Yardley', chamber: 'lords', type: 'Baroness' },
	{ name: 'The Lord Bishop of Leeds', chamber: 'lords', type: 'Bishop' },
	{ name: 'The Lord Bishop of Oxford', chamber: 'lords', type: 'Bishop' },
	{ name: 'Baroness Prashar', chamber: 'lords', type: 'Baroness' },
	{ name: 'Baroness Ritchie of Downpatrick', chamber: 'lords', type: 'Baroness' },
	{ name: 'Lord Singh of Wimbledon', chamber: 'lords', type: 'Lord' },
	{ name: 'Lord Strasburger', chamber: 'lords', type: 'Lord' },
	{ name: 'Baroness Uddin', chamber: 'lords', type: 'Baroness' },

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

// Function to download image
async function downloadImage(url: string, filepath: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(filepath)
		https
			.get(url, (response) => {
				response.pipe(file)
				file.on('finish', () => {
					file.close()
					resolve()
				})
			})
			.on('error', (err) => {
				fs.unlink(filepath, () => {}) // Delete the file async
				reject(err)
			})
	})
}

// Function to sanitize filename
function sanitizeFilename(name: string): string {
	return name
		.replace(/^(Lord |Lady |Baroness |Sir |Dr |The Lord Bishop of )/i, '')
		.replace(/ of .+$/, '')
		.replace(/[^a-z0-9]/gi, '_')
		.toLowerCase()
}

// Function to get UK Parliament image URL
function getParliamentImageUrl(name: string, chamber: string): string | null {
	if (chamber === 'commons') {
		// House of Commons portrait API
		// This is a simplified example - you'd need to lookup the member ID
		// The real API requires member lookup first
		return `https://members-api.parliament.uk/api/Members/Search?Name=${encodeURIComponent(name)}`
	} else if (chamber === 'lords') {
		// House of Lords uses a different system
		return `https://members-api.parliament.uk/api/Members/Search?House=2&Name=${encodeURIComponent(name)}`
	}
	return null
}

// Function to fetch MP data from Parliament API
async function fetchMemberData(name: string, chamber: string): Promise<any> {
	return new Promise((resolve, reject) => {
		const house = chamber === 'lords' ? '2' : '1'
		const searchUrl = `https://members-api.parliament.uk/api/Members/Search?Name=${encodeURIComponent(name)}&House=${house}`

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
	const portraitsDir = path.join(process.cwd(), 'static', 'portraits', 'signatories')
	if (!fs.existsSync(portraitsDir)) {
		fs.mkdirSync(portraitsDir, { recursive: true })
	}

	console.log('Fetching parliamentarian portraits...')

	const results = []

	for (const signatory of signatories) {
		console.log(`Processing ${signatory.name}...`)

		if (signatory.chamber === 'org') {
			// Skip organizations
			results.push({
				name: signatory.name,
				type: signatory.type,
				portrait: null,
				status: 'skipped',
				reason: 'Organization'
			})
			continue
		}

		if (signatory.chamber === 'commons' || signatory.chamber === 'lords') {
			try {
				// Fetch member data from Parliament API
				const memberData = await fetchMemberData(signatory.name, signatory.chamber)

				if (memberData.items && memberData.items.length > 0) {
					const member = memberData.items[0]
					const portraitUrl = member.value.thumbnailUrl

					if (portraitUrl) {
						const filename = sanitizeFilename(signatory.name) + '.jpg'
						const filepath = path.join(portraitsDir, filename)

						// Download the portrait
						await downloadImage(portraitUrl, filepath)

						results.push({
							name: signatory.name,
							type: signatory.type,
							portrait: `/portraits/signatories/${filename}`,
							memberId: member.value.id,
							status: 'success'
						})

						console.log(`  ✓ Downloaded portrait for ${signatory.name}`)
					} else {
						results.push({
							name: signatory.name,
							type: signatory.type,
							portrait: null,
							status: 'no_portrait'
						})
						console.log(`  ⚠ No portrait available for ${signatory.name}`)
					}
				} else {
					results.push({
						name: signatory.name,
						type: signatory.type,
						portrait: null,
						status: 'not_found'
					})
					console.log(`  ⚠ Member not found: ${signatory.name}`)
				}

				// Add delay to avoid rate limiting
				await new Promise((resolve) => setTimeout(resolve, 500))
			} catch (error) {
				console.error(`  ✗ Error fetching ${signatory.name}:`, error)
				results.push({
					name: signatory.name,
					type: signatory.type,
					portrait: null,
					status: 'error',
					error: error.message
				})
			}
		} else {
			// For Scottish, Welsh, and NI parliamentarians, we'll need different APIs
			results.push({
				name: signatory.name,
				type: signatory.type,
				portrait: null,
				status: 'needs_manual',
				reason: `${signatory.chamber} parliament API not implemented`
			})
			console.log(`  ⚠ ${signatory.name} - needs manual fetch (${signatory.chamber})`)
		}
	}

	// Save results to JSON file
	const resultsPath = path.join(portraitsDir, 'signatories.json')
	fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2))

	console.log('\nSummary:')
	console.log(`Total signatories: ${results.length}`)
	console.log(`Successful downloads: ${results.filter((r) => r.status === 'success').length}`)
	console.log(`Not found: ${results.filter((r) => r.status === 'not_found').length}`)
	console.log(`No portrait: ${results.filter((r) => r.status === 'no_portrait').length}`)
	console.log(`Needs manual: ${results.filter((r) => r.status === 'needs_manual').length}`)
	console.log(`Errors: ${results.filter((r) => r.status === 'error').length}`)
	console.log(`\nResults saved to: ${resultsPath}`)
}

// Run the script
main().catch(console.error)
