import * as fs from 'fs'
import * as path from 'path'
import { exec } from 'child_process'
import util from 'util'

// Promisify exec to use async/await
const execPromise = util.promisify(exec)

const INPUT_DIR = 'src/assets/quote-bg'
const OUTPUT_DIR = 'src/assets/quote-bg/output'

// Ensure the output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
	fs.mkdirSync(OUTPUT_DIR)
}

async function processImages() {
	const files = fs.readdirSync(INPUT_DIR)

	for (const file of files) {
		const inputFilePath = path.join(INPUT_DIR, file)
		const outputFilePath = path.join(OUTPUT_DIR, file)

		if (!inputFilePath.match(/\.(jpg|jpeg|png)$/i)) continue // Skip non-image files

		// Get original dimensions
		const originalSize = await getImageSize(inputFilePath)

		// Run the ImageMagick command with 1x1 white border and trim
		const tempFilePath = path.join(OUTPUT_DIR, `temp_${file}`)
		await execPromise(
			`magick convert "${inputFilePath}" -bordercolor white -border 1x1 -fuzz 1% -trim "${tempFilePath}"`
		)

		// Get trimmed dimensions
		const trimmedSize = await getImageSize(tempFilePath)

		// Save the trimmed file only if dimensions changed
		if (originalSize !== trimmedSize) {
			fs.renameSync(tempFilePath, outputFilePath)
			console.log(`Trimmed and saved: ${file}`)
		} else {
			fs.unlinkSync(tempFilePath) // Remove temp file if no trim occurred
			console.log(`No trimming needed for: ${file}`)
		}
	}
}

// Helper function to get image dimensions as "widthxheight" (e.g., "800x600")
async function getImageSize(filePath: string): Promise<string> {
	const { stdout } = await execPromise(`magick identify -format "%wx%h" "${filePath}"`)
	return stdout.trim()
}

processImages().catch((error) => {
	console.error('Error processing images:', error)
})
