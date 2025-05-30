export type PromptGenerator = (
	languageName: string,
	content: string,
	promptAdditions: string
) => string

export const generateJsonPrompt: PromptGenerator = (
	languageName: string,
	content: string,
	promptAdditions: string
) => {
	return `${commonHead(languageName, 'JSON', promptAdditions)}

Maintain the JSON structure and only translate the values, not the keys. Keys suffixed with an "instructions" provide additional instructions for specific translations. Always make sure the result is valid JSON syntax:

${content}

Do not start with \`\`\`json, just return the JSON.
Translated JSON:`
}

export const generateMarkdownPrompt: PromptGenerator = (
	languageName: string,
	content: string,
	promptAdditions: string
) => {
	return `${commonHead(languageName, 'Markdown', promptAdditions)}

Maintain the structure of the document. Don't modify script elements, HTML tags, link targets (including section links starting with a number sign) and file names. The content of social media widgets has to remain unchanged as well. I repeat: DO NOT CHANGE LINK TARGETS. DO NOT REMOVE SCRIPT TAGS OR COMPONENTS. The document starts with Frontmatter metadata enclosed in three dashes. Don't translate the keys of the metadata, only the values. Always make sure the result is valid Markdown syntax:

${content}

Do not start with \`\`\`md or new lines, just return the Markdown.

Translated Markdown:`
}

export function generateReviewPrompt(languageName: string) {
	return `Please review and (only if necessary) improve your translation to ${languageName} to ensure it meets the highest standards of quality.

Focus on:
1. Accuracy of meaning compared to typical English expressions
2. Natural flow and idiomaticity in ${languageName}
3. Consistency in terminology and style
4. Grammar, spelling, and punctuation
5. Maintaining the original formatting and technical elements

Make necessary improvements while preserving:
- All technical elements (keys, HTML tags, links, script elements)
- Document structure and formatting
- Special instructions in comments
- File names and technical terms when appropriate

Return the possibly improved text in the same format.

All of your response will be used to generate website pages. Readers don't want to see your own translation notes. Do NOT tell us that you have done the work, or why particular decisions were made. That would make your response invalid. Only return the translation itself.

Translation:`
}

function commonHead(languageName: string, format: string, promptAdditions: string) {
	return (
		`You are a professional translator who specializes in translating to ${languageName}. Therefore, you don't make basic errors with regard to spelling and grammar.

Translate the following ${format} content to ${languageName}.

Avoid translating word for word whenever possible. Common phrases should be adapted to the most fitting counterpart in the target language or a less figurative wording if nothing matches well. Use your judgement to determine if keeping the English word is an appropriate alternative in the target language if there is no fitting translation.

The content goes on an informative website of an activist group with the aim of achieving global coordination to stop the development of artificial intelligence systems more powerful than GPT-4. Never use histrionic language that could associate the concerns with fiction. Instead, use neutral scientific language that is still easy to understand and compelling.

When addressing the reader or the organization, use informal translations, if applicable to the target language. When addressing others and inside of quotes, stick with formal translations.` +
		promptAdditions
	)
}
