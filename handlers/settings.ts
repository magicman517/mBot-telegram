import { Composer } from 'https://deno.land/x/grammy/mod.ts';
import { usersDb } from '../clients/database.ts';
import { escapeMarkdown } from '../helpers.ts';
import { settingsMenu } from '../menus/settingsMenu.ts';

export const settingsHandler = new Composer();

export function getModels(userId: number) {
	return usersDb.query(
		'SELECT text_model, audio_model FROM users WHERE user_id = ?',
		[userId],
	)[0];
}

export function setTextModel(model: string, userId: number) {
	usersDb.query(
		'UPDATE users SET text_model = ? WHERE user_id = ?',
		[model, userId],
	);

	return usersDb.query(
		'SELECT text_model, audio_model FROM users WHERE user_id = ?',
		[userId],
	)[0];
}

export function setAudioModel(model: string, userId: number) {
	usersDb.query(
		'UPDATE users SET audio_model = ? WHERE user_id = ?',
		[model, userId],
	);

	return usersDb.query(
		'SELECT text_model, audio_model FROM users WHERE user_id = ?',
		[userId],
	)[0];
}

settingsHandler.command('settings', async (ctx) => {
	const [textModel, audioModel] = getModels(ctx.from?.id!);

	await ctx.reply(
		escapeMarkdown(
			`Text model: \`${textModel ?? 'None'}\`\n` +
				`Audio model: \`${audioModel ?? 'None'}\``,
		),
		{ reply_markup: settingsMenu, parse_mode: 'MarkdownV2' },
	);
});
