console.log('Deno version:', Deno.version.deno)
console.log('typeof window:', typeof window)
if (typeof window !== 'undefined') {
	console.log('typeof window.location:', typeof window.location)
	if (typeof window.location !== 'undefined') {
		console.log('window.location:', window.location)
	}
}
