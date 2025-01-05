export type PfpRequest = {
	canvasData: Uint8Array
	originalData: Uint8Array
	overlayData: Uint8Array
	relativeInnerDiameter: number
}

export type PfpResponse = string

export type PfpTransfer = [Uint8Array, Uint8Array, Uint8Array]
