import { StaticEasyWebWorker } from 'easy-web-worker'
import ImageScript from 'imagescript'
import type { PfpRequest, PfpResponse, PfpTransfer } from './shared'

const { onMessage } = new StaticEasyWebWorker<PfpRequest, PfpResponse>()

onMessage(async (message) => {
	const { canvasData, originalData, overlayData, relativeInnerDiameter } = message.payload
	const canvas = await ImageScript.Image.decode(canvasData)
	const original = await ImageScript.Image.decode(originalData)
	const overlay = await ImageScript.Image.decode(overlayData)

	// crop to square
	const minDimension = Math.min(original.width, original.height)
	const cropLeft = (original.width - minDimension) / 2
	const cropTop = (original.height - minDimension) / 2
	original.crop(cropLeft, cropTop, minDimension, minDimension)

	// resize to transparent portion of overlay
	original.resize(relativeInnerDiameter * canvas.width, relativeInnerDiameter * canvas.height)

	// composite
	canvas.composite(
		original,
		(canvas.width - original.width) / 2,
		(canvas.height - original.height) / 2
	)
	canvas.composite(overlay)

	const encoded = await canvas.encode()
	const blob = new Blob([encoded], { type: 'image/png' })
	const url = URL.createObjectURL(blob)
	message.resolve(url)
})
