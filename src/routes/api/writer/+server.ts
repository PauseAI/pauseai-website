import { error, json } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import Anthropic from '@anthropic-ai/sdk'
const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY

export type ChatResponse = {
	response: string
}

export type Message = {
	role: 'user' | 'assistant' | 'system'
	content: string
}

const System_Prompts: { [id: string]: string } = {}
System_Prompts['Basic'] = `You are a helpful AI assistant.`
System_Prompts['Mail'] = `
What follows is the anatomy of a good email, a set of guidelines and
criteria for writing a good mail. Each paragraph, except the last represents 
a distinct part of the email.

Subject line:
The subject line should be short, informative and clearly communicate
the goal of the mail. It must grab the attention and capture the
interest of the recipient. Avoid cliché language.

Greeting:
The greeting must match the tone of the mail. If possible, address the
recipient by the appropriate title. Keep it short, and mention the reason
for the mail. Establish a strong connection with the recipient: Are they
a politician meant to represent you? Is it regarding something they've
recently done? Make the recipient feel like they owe you an answer.

First paragraph:
Explain what the purpose of the email is. It must be concise and captivating,
most people who receive many emails learn to quickly dismiss many. Make
sure the relation is established and they have a reason to read on. 

Body paragraph:
The main body of the email should be informative and contain the information
of the mail. Take great care not to overwhelm the reader: it must be
logically structured and not too full of facts. The message should remain 
clear and the relation to the greeting and first paragraph must remain clear.
It should not be too long, otherwise it might get skimmed. Links to further
information can be provided.

Conclusion:
Keep this short and sweet. Make sure it has a CLEAR CALL TO ACTION!
Restate the reason the recipient should feel the need to act. Thank them
for their time and/or your ask.

General:
Make sure the formatting isn't too boring. Write in a manner the recipient
would respond well to: Do not argue with them, do not mention views they
probably won't share. Try to play to things they said before and that fit
their persona. Keep the tone consistent and not too emotional. Do not sound
crazy.
`
System_Prompts['Checklist'] = `
Checklist Before Sending
Message Verification
    Is the purpose crystal clear?
    Have I provided necessary context?
    Is there a specific, achievable call to action?
    Have I proofread for tone and clarity?
`

System_Prompts['First_Draft'] = `
Using the information that will be provided by the user, write the mail 
according to the criteria. Get all the information into the mail. 
Don't worry about it being too long. Keep the message powerful.
`

System_Prompts['First_Cut'] = `
You will be provided with an email by the user. 
Remove redundant information and clean up the structure. The point of this pass is 
to have the structure clear and the mail slightly longer than needed. The message 
should be clear, the information still mostly present, with only what is 
absolutely necessary being removed.
`

System_Prompts['First_Edit'] = `
You will be provided with an email by the user. The following points are paramount:
Make sure the flow of information is natural. All paragraphs should be
connected in a sensical manner. Remove odd, unfitting or overly emotional
language. Make sure the paragraphs fulfill their roles.
`

System_Prompts['Tone_Edit'] = `
You will be provided with an email by the user. The following points are paramount:
Adjust the language to match recipient's communication style. Remove potentially 
offensive or dismissive language. Ensure the tone matches the relationship and 
purpose. Make sure the points and information is relevant for the recipient. 
Assume the recipient's position: How would they react to the mail? What information 
would resonate with them? What wouldn't? Do not compromise on the message.
`

System_Prompts['Final_Edit'] = `
You will be provided with an email by the user. Make sure the email matches the 
criteria initially described. Check spelling, grammar and tone.
`

System_Prompts['Making_Template'] = `
Making a template out of an email requires a good email as a base, then punching massive
holes into the email to allow for the fitting of new information, specifically in tone
and style as well as personal connection. The information should be kept, as well as the 
structural flow of the email and especially between the paragraphs. Provide clearly 
denoted comments on what was removed and by what it should be replaced.

The user will provide an email for you to turn into a template using the method described before.
`

System_Prompts['Improving_Template'] = `
Assume the role of someone filling in the email template. How much do you have to 
rewrite text to make you contributions fit? Can you keep the email brief? Are you restricted
by any word choices and sentence structures? Can you instert your own personality into the
template without too much effort? With these considerations, improve the template.

The user will provide an email template for you to improve using the method described before.
`

System_Prompts['Explain'] = `
When making choices, provide a clearly labeled rationale for why you chose as you did
and what informed those decisions.
`

System_Prompts['Results'] = `
Only reply with the final results, a.k.a. the final email, and absolutely nothing else.
`

System_Prompts['Research'] = `
Please replace all mentions of 'undefined' with the apropriate information that should
go in that space, derived from the rest of the information. Output the full information, including your edits. Output nothing else.
`

const anthropic = new Anthropic({
	apiKey: ANTHROPIC_API_KEY // defaults to process.env["ANTHROPIC_API_KEY"]
})

/*
const msg = await anthropic.messages.create({
  model: "claude-3-7-sonnet-20250219",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello, Claude" }],
});
*/

export async function POST({ fetch, request }) {
	const messages = await request.json()
	var info = messages[0].content
	if (info == '') {
		return
	}
	System_Prompts['Information'] = info

	// RESEARCH
	info = await anthropic.messages.create({
		model: 'claude-3-7-sonnet-20250219',
		max_tokens: 1024,
		system:
			System_Prompts['Basic'] +
			System_Prompts['Mail'] +
			System_Prompts['Information'] +
			System_Prompts['Research'],
		messages: [
			{
				role: 'user',
				content:
					"Hello! Please update the list of information by replacing all instances of 'undefined' with something that belongs under their respective header based on the rest of the information provided. Thank you!"
			}
		]
	})
	System_Prompts['Information'] = info.content[0].text

	// FIRST DRAFT
	var msg = await anthropic.messages.create({
		model: 'claude-3-7-sonnet-20250219',
		max_tokens: 1024,
		system:
			System_Prompts['Basic'] +
			System_Prompts['Mail'] +
			System_Prompts['First_Draft'] +
			System_Prompts['Results'],
		messages: [
			{
				role: 'user',
				content:
					'Hello! Please write an email draft using the following information. \n' +
					System_Prompts['Information']
			}
		]
	})
	var email = msg.content[0].text

	// FIRST CUT
	msg = await anthropic.messages.create({
		model: 'claude-3-7-sonnet-20250219',
		max_tokens: 1024,
		system:
			System_Prompts['Basic'] +
			System_Prompts['Mail'] +
			System_Prompts['Information'] +
			System_Prompts['First_Cut'] +
			System_Prompts['Results'],
		messages: [
			{ role: 'user', content: 'Hello! Please cut the following email draft. \n \n' + email }
		]
	})
	email = msg.content[0].text

	// FIRST EDIT
	msg = await anthropic.messages.create({
		model: 'claude-3-7-sonnet-20250219',
		max_tokens: 1024,
		system:
			System_Prompts['Basic'] +
			System_Prompts['Mail'] +
			System_Prompts['Information'] +
			System_Prompts['First_Edit'] +
			System_Prompts['Results'],
		messages: [
			{ role: 'user', content: 'Hello! Please edit the following email draft. \n \n' + email }
		]
	})
	email = msg.content[0].text

	// TONE EDIT
	msg = await anthropic.messages.create({
		model: 'claude-3-7-sonnet-20250219',
		max_tokens: 1024,
		system:
			System_Prompts['Basic'] +
			System_Prompts['Mail'] +
			System_Prompts['Information'] +
			System_Prompts['Tone_Edit'] +
			System_Prompts['Results'],
		messages: [
			{
				role: 'user',
				content: 'Hello! Please edit the tone of the following email draft. \n \n' + email
			}
		]
	})
	email = msg.content[0].text

	// FINAL EDIT
	msg = await anthropic.messages.create({
		model: 'claude-3-7-sonnet-20250219',
		max_tokens: 1024,
		system:
			System_Prompts['Basic'] +
			System_Prompts['Mail'] +
			System_Prompts['Information'] +
			System_Prompts['Final_Edit'] +
			System_Prompts['Checklist'] +
			System_Prompts['Results'],
		messages: [
			{ role: 'user', content: 'Hello! Please edit the following email draft. \n \n' + email }
		]
	})
	email = msg.content[0].text

	return json({ response: email } as ChatResponse)
}
