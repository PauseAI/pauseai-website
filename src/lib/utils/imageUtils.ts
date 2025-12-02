export function sanitizeNameForImage(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters except spaces and hyphens
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
}
