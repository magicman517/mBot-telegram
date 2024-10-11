import { Composer } from 'https://deno.land/x/grammy/mod.ts';
import { usersDb } from '../clients/database.ts';
import { escapeMarkdown } from '../helpers.ts';
import groq from '../clients/groq.ts';

export const audioHandler = new Composer();

audioHandler.on(
	['message:audio', 'message:voice', 'message:video_note'],
	async (ctx) => {
		// get model
		const [model] = usersDb.query(
			'SELECT audio_model FROM users WHERE user_id = ?',
			[ctx.from?.id],
		)[0];

		// download audio
		const fileData = await ctx.getFile();

		const response = await fetch(
			`https://api.telegram.org/file/bot${
				Deno.env.get('BOT_TOKEN')
			}/${fileData.file_path}`,
		)
			.catch(async (err) => {
				console.error(err);
				await ctx.reply('Error downloading audio, please try again');
			});

		if (!response) {
			return await ctx.reply('Error downloading audio, please try again');
		}

		// save audio
		const arrayBuffer = await response.arrayBuffer();
		const uint8Array = new Uint8Array(arrayBuffer);

		await Deno.writeFile(
			`${fileData.file_id}.mp3`,
			uint8Array,
		);

		const fileContent = await Deno.readFile(`${fileData.file_id}.mp3`);

		await ctx.api.sendChatAction(ctx.chat.id, 'typing');

		// create transcription
		await groq.audio.transcriptions.create({
			file: new File([fileContent], `${fileData.file_id}.mp3`, {
				type: 'audio/mpeg',
			}),
			// @ts-ignore: groq team does not update models in groq-sdk for some reason
			model: model ?? 'whisper-large-v3',
		})
			.then(async (transcription) => {
				await ctx.reply(transcription.text, {
					reply_parameters: { message_id: ctx.msg.message_id },
				});
			})
			.catch(async (err) => {
				console.error(err);
				await ctx.deleteMessage();
				await ctx.reply(
					escapeMarkdown(err.error.error.message),
					{
						parse_mode: 'MarkdownV2',
						reply_parameters: { message_id: ctx.msg.message_id },
					},
				);
			});
		await Deno.remove(`${fileData.file_id}.mp3`);
	},
);
