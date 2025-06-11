#!/usr/bin/env node

/**
 * Build log filter script
 *
 * This script runs the build command and filters out noisy output like individual chunk listings,
 * while summarizing the chunks by type and size at the end of the build.
 *
 * Usage: node filter-build-log.js [build command]
 */

import { spawn } from 'child_process'
import readline from 'readline'

// Check if --verbose is anywhere in the command line
const hasVerbose = process.argv.includes('--verbose')

if (hasVerbose) {
	// Just run the command with no filtering
	const buildCommand = process.argv[2]
	const [program, ...args] = buildCommand.split(' ')
	const build = spawn(program, args, { shell: true, stdio: 'inherit' })
	build.on('exit', (code) => process.exit(code))
} else {
	// Default to running build:dev if no command provided
	const buildCommand = process.argv[2] || 'npm run build:dev'

	// Split the command into program and args
	const [program, ...args] = buildCommand.split(' ')

	// Stats counters
	let clientChunks = 0
	let serverChunks = 0
	let clientSize = 0
	let serverSize = 0

	// Chunk pattern - match svelte-kit output chunks with size info
	const chunkPattern = /\.svelte-kit\/output\/(client|server)\/.*\s+(\d+\.\d+)\s+kB/

	// Start the build process
	const build = spawn(program, args, { shell: true, stdio: ['inherit', 'pipe', 'inherit'] })

	// Create a readline interface to process the output line by line
	const rl = readline.createInterface({
		input: build.stdout,
		crlfDelay: Infinity
	})

	// Process each line
	rl.on('line', (line) => {
		// Check if this is a chunk line
		const chunkMatch = chunkPattern.exec(line)
		if (chunkMatch) {
			// This is a chunk line - extract information but don't print it
			const [_, type, sizeStr] = chunkMatch
			const size = parseFloat(sizeStr)

			// Classify chunks solely based on their paths
			if (type === 'client') {
				clientChunks++
				clientSize += size
			} else if (type === 'server') {
				serverChunks++
				serverSize += size
			}

			// Don't output the chunk line
			return
		}

		// Pass through all other lines
		console.log(line)
	})

	// Print the final summary when the process exits
	build.on('exit', (code) => {
		// Print the complete build summary
		if (clientChunks > 0 || serverChunks > 0) {
			console.log(`\n📊 Complete build summary:`)

			if (clientChunks > 0) {
				console.log(`   Client: ${clientChunks} chunks (${clientSize.toFixed(2)} kB)`)
			}

			if (serverChunks > 0) {
				console.log(`   Server: ${serverChunks} chunks (${serverSize.toFixed(2)} kB)`)
			}

			if (clientChunks > 0 && serverChunks > 0) {
				console.log(
					`   Total: ${clientChunks + serverChunks} chunks (${(clientSize + serverSize).toFixed(2)} kB)`
				)
			}
		}

		console.log(`\n🏁 Build process completed with code ${code}`)
		process.exit(code)
	})
}
