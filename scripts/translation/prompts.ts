export function generateJsonPrompt(languageName: string, content: string) {
	return `You are a professional translator who specializes in translating to ${languageName}. Therefore, you don't make basic errors with regard to spelling and grammar.

Translate the following JSON content to ${languageName}. Avoid translating word for word whenever possible. Commons phrases should be adapted to the most fitting counterpart in the target language or a less figurative wording if nothing matches well. The content goes on an informative website of an activist group with the aim of achieving global coordination to stop the development of artificial intelligence systems more powerful than GPT-4. Never use histrionic language that could associate the concerns with fiction. Instead, use neutral scientific language that is still easy to understand and compelling.

Maintain the JSON structure and only translate the values, not the keys. Ensure the result is valid JSON syntax:

${content}

Do not start with \`\`\`json, just return the JSON.
Translated JSON:`
}
