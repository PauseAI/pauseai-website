#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Function to get image dimensions using sips (macOS)
function getImageDimensions(/** @type {string} */ imagePath) {
	try {
		const output = execSync(`sips -g pixelHeight -g pixelWidth "${imagePath}"`).toString()
		const width = parseInt(output.match(/pixelWidth:\s*(\d+)/)?.[1] || '0')
		const height = parseInt(output.match(/pixelHeight:\s*(\d+)/)?.[1] || '0')
		return { width, height }
	} catch (error) {
		throw new Error(
			`Failed to get dimensions: ${error instanceof Error ? error.message : String(error)}`
		)
	}
}

// Function to resize image using sips
function resizeImage(
	/** @type {string} */ inputPath,
	/** @type {string} */ outputPath,
	size = 400
) {
	try {
		execSync(`sips -z ${size} ${size} "${inputPath}" --out "${outputPath}"`)
		return true
	} catch (error) {
		throw new Error(
			`Failed to resize image: ${error instanceof Error ? error.message : String(error)}`
		)
	}
}

// Function to validate image meets requirements
function validateImage(/** @type {string} */ imagePath) {
	// Check if file exists and is a .jpg
	if (!fs.existsSync(imagePath)) {
		throw new Error('File does not exist')
	}

	if (!imagePath.toLowerCase().endsWith('.jpg')) {
		throw new Error('File is not a .jpg')
	}

	// Get dimensions
	const { width, height } = getImageDimensions(imagePath)

	// Check if square
	if (width !== height) {
		throw new Error(`Image is not square: ${width}x${height}`)
	}

	// Check if large enough
	if (width < 400 || height < 400) {
		throw new Error(`Image is too small: ${width}x${height} (minimum 400x400)`)
	}

	return { width, height }
}

async function main() {
	const signatoryDir = path.join(path.dirname(__dirname), 'static', 'portraits', 'signatories')
	const processedDir = path.join(path.dirname(__dirname), 'static', 'portraits', 'processed')

	console.log('Processing portraits to 400x400...\n')

	// Get all subdirectories (commons, lords, senedd, scotland, ni)
	const chambers = ['commons', 'lords', 'senedd', 'scotland', 'ni']

	let totalProcessed = 0
	let totalErrors = 0

	for (const chamber of chambers) {
		const inputDir = path.join(signatoryDir, chamber)
		const outputDir = path.join(processedDir, chamber)

		console.log(`Processing ${chamber}...`)

		// Check if input directory exists
		if (!fs.existsSync(inputDir)) {
			console.log(`  ⚠ Directory ${inputDir} does not exist, skipping`)
			continue
		}

		// Ensure output directory exists
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true })
		}

		// Get all .jpg files in the directory
		const files = fs.readdirSync(inputDir).filter((file) => file.toLowerCase().endsWith('.jpg'))

		if (files.length === 0) {
			console.log(`  ⚠ No .jpg files found in ${chamber}`)
			continue
		}

		let processed = 0
		let errors = 0

		for (const file of files) {
			const inputPath = path.join(inputDir, file)
			const outputPath = path.join(outputDir, file)

			try {
				// Validate the image
				const { width, height } = validateImage(inputPath)

				// Resize the image
				resizeImage(inputPath, outputPath, 400)

				// Verify the output
				const outputDims = getImageDimensions(outputPath)
				if (outputDims.width !== 400 || outputDims.height !== 400) {
					throw new Error(`Output image is not 400x400: ${outputDims.width}x${outputDims.height}`)
				}

				console.log(`  ✓ ${file} (${width}x${height} → 400x400)`)
				processed++
			} catch (error) {
				console.log(`  ✗ ${file}: ${error instanceof Error ? error.message : String(error)}`)
				errors++
			}
		}

		console.log(`  ${chamber}: ${processed} processed, ${errors} errors\n`)
		totalProcessed += processed
		totalErrors += errors
	}

	console.log('='.repeat(50))
	console.log(`Summary:`)
	console.log(`✓ Total processed: ${totalProcessed}`)
	console.log(`✗ Total errors: ${totalErrors}`)

	// Show directory structure
	console.log('\nProcessed portraits directory structure:')
	for (const chamber of chambers) {
		const outputDir = path.join(processedDir, chamber)
		if (fs.existsSync(outputDir)) {
			const files = fs.readdirSync(outputDir).filter((f) => f.endsWith('.jpg'))
			if (files.length > 0) {
				console.log(`  processed/${chamber}: ${files.length} files`)
			}
		}
	}
}

main().catch(console.error)
