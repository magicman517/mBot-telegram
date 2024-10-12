import { Composer } from 'https://deno.land/x/grammy/mod.ts';
import { contextDb, usersDb } from '../clients/database.ts';
import { escapeMarkdown, getImageBase64 } from '../helpers.ts';
import groq from '../clients/groq.ts';

type ContextItem = [number, string, string, string];

export const textHandler = new Composer();

// this handler is messy asf and needs to be refactored
textHandler.on('message', async (ctx) => {
    if (ctx.message.photo && !ctx.message.caption) {
        return await ctx.reply(
            escapeMarkdown(
                'You’ve only uploaded an image. To use AI chat with image analysis, please add a prompt related to your image.',
            ),
            {
                parse_mode: 'MarkdownV2',
                reply_parameters: { message_id: ctx.msg.message_id },
            },
        );
    }

    const [model] = usersDb.query(
        'SELECT text_model FROM users WHERE user_id = ?',
        [ctx.from.id],
    )[0];

    const context: ContextItem[] = contextDb.query(
        'SELECT * FROM context WHERE user_id = ?',
        [ctx.from.id],
    );

    const messages = [];

    // get image base64 if attached to message
    let base64: string | undefined;
    if (ctx.message.photo) {
        if (model !== 'llama-3.2-11b-vision-preview') {
            return await ctx.reply(
                escapeMarkdown(
                    "Current model doesn't support image analysis",
                ),
                {
                    parse_mode: 'MarkdownV2',
                    reply_parameters: { message_id: ctx.msg.message_id },
                },
            );
        }

        const photo = ctx.message.photo[ctx.message.photo.length - 1];
        const photoPath = await ctx.api.getFile(photo.file_id);

        base64 = await getImageBase64(
            `https://api.telegram.org/file/bot${Deno.env.get('BOT_TOKEN')
            }/${photoPath.file_path}`,
        );
    }

    // add every message from context to messages
    for (const [_user_id, sender, message, image] of context) {
        messages.push({
            'role': sender,
            'content': sender === 'assistant'
                ? message
                : image
                    ? [{ 'type': 'text', 'text': message }, {
                        'type': 'image_url',
                        'image_url': { 'url': image },
                    }]
                    : [{ 'type': 'text', 'text': message }],
        });
    }

    // add current prompt to context
    messages.push({
        'role': 'user',
        'content': base64
            ? [{
                'type': 'text',
                'text': ctx.message.text ?? ctx.message.caption,
            }, { 'type': 'image_url', 'image_url': { 'url': base64 } }]
            : [{
                'type': 'text',
                'text': ctx.message.text ?? ctx.message.caption,
            }],
    });

    await ctx.api.sendChatAction(ctx.chat.id, 'typing');

    // @ts-ignore: create function expects different messages format
    await groq.chat.completions.create({
        messages: messages,
        // @ts-ignore: groq team does not update models in groq-sdk for some reason
        model: model ?? 'llama-3.2-1b-preview',
    })
        .then(async (completion) => {
            if (!completion.choices[0].message.content) {
                return await ctx.reply(
                    escapeMarkdown('No response from model'),
                    {
                        parse_mode: 'MarkdownV2',
                        reply_parameters: { message_id: ctx.msg.message_id },
                    },
                );
            }

            // send response in parts if it's too long
            const fullText = completion.choices[0].message.content;
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
                `INSERT INTO context (user_id, sender, message, image) VALUES (?, ?, ?, ?)`,
                [
                    ctx.from.id,
                    'user',
                    ctx.message?.text ?? ctx.message.caption,
                    base64 ?? null,
                ],
            );

            contextDb.query(
                `INSERT INTO context (user_id, sender, message, image) VALUES (?, ?, ?, ?)`,
                [
                    ctx.from.id,
                    'assistant',
                    completion.choices[0].message.content,
                    null,
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
