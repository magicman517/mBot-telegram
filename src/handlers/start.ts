import { Composer } from 'https://deno.land/x/grammy@v1.30.0/mod.ts';
import { contextDb, usersDb } from '../clients/database.ts';
import { escapeMarkdown } from '../helpers.ts';

export const startHandler = new Composer();

startHandler.command('start', async (ctx) => {
    // delete record if exists, then insert new one
    contextDb.query('DELETE FROM context WHERE user_id = ?', [ctx.from?.id]);

    usersDb.query('DELETE FROM users WHERE user_id = ?', [ctx.from?.id]);
    usersDb.query(
        'INSERT INTO users (user_id, text_model, audio_model) VALUES (?, ?, ?)',
        [ctx.from?.id, 'llama-3.2-3b-preview', 'whisper-large-v3-turbo'],
    );

    await ctx.reply(
        escapeMarkdown(
            "Send an audio, voice, or video note, and I'll convert it to text.\n" +
            'You can also send a message to begin a conversation!\n\n' +
            'Available commands:\n' +
            '`/start` - restart bot and erase your settings\n' +
            '`/settings` - open settings menu\n' +
            '`/clear` - clear conversation history',
        ),
        { parse_mode: 'MarkdownV2' },
    );
});
