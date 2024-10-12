import { Menu } from 'https://deno.land/x/grammy_menu/mod.ts';
import { setTextModel } from '../handlers/settings.ts';
import { escapeMarkdown } from '../helpers.ts';

const textModels = [
    'gemma-7b-it',
    'gemma2-9b-it',
    'mixtral-8x7b-32768',
    'llama3-8b-8192',
    'llama3-70b-8192',
    'llama-3.1-8b-instant',
    'llama-3.1-70b-versatile',
    'llama-3.2-1b-preview',
    'llama-3.2-3b-preview',
    'llama-3.2-11b-vision-preview',
];

export const textModelMenu = new Menu('textModel');
textModels.forEach((model) => {
    textModelMenu.text(model, async (ctx) => {
        const [textModel, audioModel] = setTextModel(model, ctx.from?.id!);

        await ctx.editMessageText(
            escapeMarkdown(
                `Text model: \`${textModel ?? 'None'}\`\n` +
                `Audio model: \`${audioModel ?? 'None'}\``,
            ),
            { parse_mode: 'MarkdownV2' },
        );
    }).row();
});
textModelMenu.back('Back');
