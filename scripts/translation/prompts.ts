export type PromptGenerator = (languageName: string, content: string) => string

export const generateJsonPrompt: PromptGenerator = (languageName: string, content: string) => {
	return `${commonHead(languageName, 'JSON')}

Maintain the JSON structure and only translate the values, not the keys. Keys prefixed with an underscore provide additional instructions for specific translations. Always make sure the result is valid JSON syntax:

${content}

Do not start with \`\`\`json, just return the JSON.
Translated JSON:`
}

export const generateMarkdownPrompt: PromptGenerator = (languageName: string, content: string) => {
	return `${commonHead(languageName, 'Markdown')}

Maintain the structure of the document and don't modify script elements, HTML tags, link targets (including section links starting with a number sign) and file names. The content of social media widgets has to remain unchanged as well. The document starts with Frontmatter metadata enclosed in three dashes. Don't translate the keys of the metadata, only the values. Always make sure the result is valid Markdown syntax:

${content}

Do not start with \`\`\`md or new lines, just return the Markdown.
Translated Markdown:`
}

function commonHead(languageName: string, format: string) {
	return `You are a professional translator who specializes in translating to ${languageName}. Therefore, you don't make basic errors with regard to spelling and grammar.

Translate the following ${format} content to ${languageName}. Avoid translating word for word whenever possible. Commons phrases should be adapted to the most fitting counterpart in the target language or a less figurative wording if nothing matches well. Use your judgement to determine if keeping the English word is an appropriate alternative in the target language if there is no fitting translation. The content goes on an informative website of an activist group with the aim of achieving global coordination to stop the development of artificial intelligence systems more powerful than GPT-4. Never use histrionic language that could associate the concerns with fiction. Instead, use neutral scientific language that is still easy to understand and compelling.`
}
