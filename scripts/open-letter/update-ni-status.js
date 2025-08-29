#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
	const jsonPath = path.join(
		path.dirname(path.dirname(__dirname)),
		'static',
		'open-letter',
		'portraits',
		'signatories',
		'signatories-square.json'
	)

	// Read the JSON file
	const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

	console.log('Updating Northern Ireland MLA statuses...\n')

	// Map of portrait filenames to proper names
	const niPortraitMap = {
		'connie_egan.jpg': 'Connie Egan',
		'deborah_erskine.jpg': 'Deborah Erskine',
		'doug_beattie.jpg': 'Doug Beattie MC',
		'gerry_carroll.jpg': 'Gerry Carroll',
		'harry_harvey.jpg': 'Harry Harvey',
		'keith-buchanan.jpg': 'Keith Buchanan',
		'naomi_long.jpg': 'Naomi Long',
		'peter_martin.jpg': 'Peter Martin',
		'sinead_mclaughlin.jpg': 'Sinéad McLaughlin',
		'stewart_dickson.jpg': 'Stewart Dickson'
	}

	let updated = 0

	// Update NI MLA entries
	for (let i = 0; i < data.length; i++) {
		const signatory = data[i]

		if (signatory.chamber === 'ni' && signatory.type === 'MLA') {
			// Find matching portrait file
			let portraitFile = null
			for (const [filename, name] of Object.entries(niPortraitMap)) {
				if (name === signatory.name) {
					portraitFile = filename
					break
				}
			}

			if (portraitFile) {
				data[i] = {
					...signatory,
					portrait: `/open-letter/portraits/signatories/ni/${portraitFile}`,
					status: 'success'
				}
				console.log(`✓ Updated ${signatory.name} → ${portraitFile}`)
				updated++
			} else {
				console.log(`⚠ No portrait found for ${signatory.name}`)
			}
		}
	}

	// Write back to file
	fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2))

	console.log(`\n${'='.repeat(50)}`)
	console.log(`Updated ${updated} Northern Ireland MLAs`)
	console.log('JSON file updated successfully')
}

main().catch(console.error)
