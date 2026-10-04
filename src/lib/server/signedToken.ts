// The token shape the website's HMAC tokens share: `v1.<expiry>.<signature>`, where
// `<expiry>` is a Unix time in seconds and `<signature>` is the unpadded base64url
// HMAC-SHA256, keyed by the UTF-8 bytes of the secret, of `<prefix>:<expiry>`. Each
// caller owns a purpose-bound prefix, so a token minted for one purpose never
// verifies for another.

const VERSION = 'v1'
// HMAC-SHA256 is 32 bytes: 43 base64url characters, unpadded.
const SIGNATURE = /^[A-Za-z0-9_-]{43}$/

export type TokenVerdict = 'valid' | 'missing' | 'malformed' | 'expired' | 'invalid'

const encoder = new TextEncoder()

const hmacKey = (secret: string, usage: 'sign' | 'verify') =>
	crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
		usage
	])

function toBase64Url(bytes: ArrayBuffer): string {
	return btoa(String.fromCharCode(...new Uint8Array(bytes)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
	const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/') + '=')
	return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

export async function signToken(
	secret: string,
	prefix: string,
	expirySeconds: number
): Promise<string> {
	const expiry = String(expirySeconds)
	const signature = await crypto.subtle.sign(
		'HMAC',
		await hmacKey(secret, 'sign'),
		encoder.encode(`${prefix}:${expiry}`)
	)
	return `${VERSION}.${expiry}.${toBase64Url(signature)}`
}

export async function checkToken(
	secret: string,
	prefix: string,
	token: string,
	now: number
): Promise<TokenVerdict> {
	if (!token) return 'missing'
	const [version, expiry, signature, ...rest] = token.split('.')
	if (
		version !== VERSION ||
		!/^\d{1,12}$/.test(expiry ?? '') ||
		!SIGNATURE.test(signature ?? '') ||
		rest.length
	) {
		return 'malformed'
	}
	// crypto.subtle.verify compares in constant time.
	const genuine = await crypto.subtle.verify(
		'HMAC',
		await hmacKey(secret, 'verify'),
		fromBase64Url(signature),
		encoder.encode(`${prefix}:${expiry}`)
	)
	if (!genuine) return 'invalid'
	return Number(expiry) * 1000 <= now ? 'expired' : 'valid'
}
