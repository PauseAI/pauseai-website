/** Browser only: downloads and image encoding for the tools. */

function download(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	document.body.appendChild(a)
	a.click()
	a.remove()
	setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadText(text: string, filename: string, mime: string) {
	download(new Blob([text], { type: mime }), filename)
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Could not create the image'))),
			'image/png'
		)
	})
}

export function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string): Promise<void> {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (!blob) return reject(new Error('Could not create the image'))
			download(blob, filename)
			resolve()
		}, 'image/png')
	})
}
