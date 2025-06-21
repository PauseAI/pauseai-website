const ADDITIONS_PER_PAGE: Record<string, string> = {}

const ADDITIONS_PER_LANGUAGE: Record<string, string> = {}

const ADDITIONS_PER_PAGE_PER_LANGUAGE: Record<string, Record<string, string>> = {}

export function collectPromptAdditions(page: string, language: string) {
	const possibleAdditions = [
		ADDITIONS_PER_PAGE[page],
		ADDITIONS_PER_LANGUAGE[language],
		ADDITIONS_PER_PAGE_PER_LANGUAGE[page]?.[language]
	]

	let concatenated = ''

	for (const addition of possibleAdditions) {
		if (addition) concatenated += `\n\n${addition}`
	}

	return concatenated
}
