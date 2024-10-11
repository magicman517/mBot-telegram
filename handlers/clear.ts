import { Composer } from 'https://deno.land/x/grammy/mod.ts';
import { contextDb } from '../clients/database.ts';

export const clearHandler = new Composer();

clearHandler.command('clear', async (ctx) => {
	contextDb.query('DELETE FROM context WHERE user_id = ?', [ctx.from?.id]);

	await ctx.react('👍');
});
