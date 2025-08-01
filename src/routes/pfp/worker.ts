/// <reference lib="dom" />

import { StaticEasyWebWorker } from 'easy-web-worker'
import type { PfpRequest, PfpResponse } from './shared'

const { onMessage } = new StaticEasyWebWorker<PfpRequest, PfpResponse>()

onMessage(async (message) => {
	const CANVAS_WIDTH = 512
	const CANVAS_HEIGHT = 512

	const { originalData, overlayData, relativeInnerDiameter } = message.payload

	const originalBitmap = await createImageBitmap(new Blob([originalData]))
	const overlayBitmap = await createImageBitmap(new Blob([overlayData]))

	const minDimension = Math.min(originalBitmap.width, originalBitmap.height)
	const cropLeft = (originalBitmap.width - minDimension) / 2
	const cropTop = (originalBitmap.height - minDimension) / 2

	const offscreenCanvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
	const ctx = offscreenCanvas.getContext('2d')
	if (!ctx) {
		message.reject('Could not get 2D context')
		return
	}

	const resizedWidth = relativeInnerDiameter * CANVAS_WIDTH
	const resizedHeight = relativeInnerDiameter * CANVAS_HEIGHT

	ctx.drawImage(
		originalBitmap,
		cropLeft,
		cropTop,
		minDimension,
		minDimension,
		(CANVAS_WIDTH - resizedWidth) / 2,
		(CANVAS_HEIGHT - resizedHeight) / 2,
		resizedWidth,
		resizedHeight
	)

	ctx.drawImage(overlayBitmap, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

	const blob = await offscreenCanvas.convertToBlob({ type: 'image/png' })
	const url = URL.createObjectURL(blob)
	message.resolve(url)
})
