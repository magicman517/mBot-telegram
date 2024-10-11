import { Composer } from 'https://deno.land/x/grammy/mod.ts';
import { contextDb, usersDb } from '../clients/database.ts';
import groq from '../clients/groq.ts';
import { escapeMarkdown } from '../helpers.ts';

export const textHandler = new Composer();

// image analysis is not yet implemented
textHandler.on('message:text', async (ctx) => {
	const [model] = usersDb.query(
		'SELECT text_model FROM users WHERE user_id = ?',
		[ctx.from.id],
	)[0];

	const context = contextDb.query(
		'SELECT * FROM context WHERE user_id = ?',
		[ctx.from.id],
	);

	const messages = [];

	// add every message from context to messages
	for (const [_user_id, sender, message, _timestamp] of context) {
		messages.push({
			'role': sender,
			'content': message,
		});
	}

	// add current prompt to context
	messages.push({
		'role': 'user',
		'content': ctx.message?.text,
	});

	await ctx.api.sendChatAction(ctx.chat.id, 'typing');

	// @ts-ignore: create function expects different messages format
	await groq.chat.completions.create({
		messages: messages,
		// @ts-ignore: groq team does not update models in groq-sdk for some reason
		model: model ?? 'llama3-8b-8192',
	})
		.then(async (completion) => {
			contextDb.query(
				`
        INSERT INTO context (user_id, sender, message, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
				[ctx.from.id, 'user', ctx.message?.text],
			);

			// send response in parts if it's too long
			const fullText = completion.choices[0].message.content ??
				'No response from model';
			const maxLength = 4096;
			let currentIndex = 0;

			while (currentIndex < fullText.length) {
				const part = fullText.slice(
					currentIndex,
					currentIndex + maxLength,
				);
				await ctx.reply(escapeMarkdown(part), {
					parse_mode: 'MarkdownV2',
					reply_parameters: { message_id: ctx.msg.message_id },
				});
				currentIndex += maxLength;
			}

			contextDb.query(
				`
        INSERT INTO context (user_id, sender, message, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
				[
					ctx.from.id,
					'assistant',
					completion.choices[0].message.content,
				],
			);
		})
		.catch(async (err) => {
			console.log(err);
			await ctx.reply(
				escapeMarkdown(err.error.error.message),
				{
					parse_mode: 'MarkdownV2',
					reply_parameters: { message_id: ctx.msg.message_id },
				},
			);
		});
});
