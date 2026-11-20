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

export function exportFilename(parts: string[], ext: string): string {
	return `pauseai-${parts.join('-')}.${ext}`
}

const MM_TO_PT = 72 / 25.4

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

async function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<ArrayBuffer> {
	return (await canvasToPngBlob(canvas)).arrayBuffer()
}

/** Builds a multi-page PDF at trim size plus bleed, one page per canvas, with TrimBox/BleedBox set so print shops can find the trim. */
export async function pdfBytesForPrint(
	canvases: HTMLCanvasElement[],
	format: { widthMm: number; heightMm: number },
	bleedMm: number
): Promise<Uint8Array> {
	// Loaded on demand so the editor page stays light.
	const { PDFDocument } = await import('pdf-lib')
	const pdf = await PDFDocument.create()
	const bleed = bleedMm * MM_TO_PT
	const trimW = format.widthMm * MM_TO_PT
	const trimH = format.heightMm * MM_TO_PT
	const pageW = trimW + bleed * 2
	const pageH = trimH + bleed * 2
	for (const canvas of canvases) {
		const page = pdf.addPage([pageW, pageH])
		const image = await pdf.embedPng(await canvasToPngBytes(canvas))
		page.drawImage(image, { x: 0, y: 0, width: pageW, height: pageH })
		page.setTrimBox(bleed, bleed, trimW, trimH)
		page.setBleedBox(0, 0, pageW, pageH)
	}
	pdf.setTitle('PauseAI materials')
	return pdf.save()
}

/**
 * PDF at trim size plus bleed, one page per canvas (a business card's front and back), with TrimBox/BleedBox set so
 * print shops can find the trim.
 */
export async function downloadCanvasPdf(
	canvas: HTMLCanvasElement | HTMLCanvasElement[],
	format: { widthMm: number; heightMm: number },
	bleedMm: number,
	filename: string
): Promise<void> {
	const bytes = await pdfBytesForPrint(Array.isArray(canvas) ? canvas : [canvas], format, bleedMm)
	download(new Blob([bytes as BlobPart], { type: 'application/pdf' }), filename)
}

/** Builds a multi-page PDF for a digital (pixel-sized) format, one page per PNG at 1px = 1pt. No bleed/trim — for sharing, not print. */
export async function pdfBytesDigital(
	images: { png: Blob; width: number; height: number }[]
): Promise<Uint8Array> {
	const { PDFDocument } = await import('pdf-lib')
	const pdf = await PDFDocument.create()
	for (const { png, width, height } of images) {
		const page = pdf.addPage([width, height])
		const image = await pdf.embedPng(await png.arrayBuffer())
		page.drawImage(image, { x: 0, y: 0, width, height })
	}
	pdf.setTitle('PauseAI materials')
	return pdf.save()
}

/** JSZip, loaded on demand so the editor page stays light. */
async function newZip() {
	const { default: JSZip } = await import('jszip')
	return new JSZip()
}

/** Zips named files into one download, e.g. a campaign pack's PNGs and print PDFs. */
export async function downloadFilesZip(
	files: { name: string; data: Blob | Uint8Array }[],
	filename: string
): Promise<void> {
	const zip = await newZip()
	for (const f of files) zip.file(f.name, f.data)
	download(await zip.generateAsync({ type: 'blob' }), filename)
}
