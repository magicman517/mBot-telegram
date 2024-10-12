import { Menu } from 'https://deno.land/x/grammy_menu/mod.ts';
import { setAudioModel } from '../handlers/settings.ts';
import { escapeMarkdown } from '../helpers.ts';

const audioModels = [
    'whisper-large-v3',
    'whisper-large-v3-turbo',
    'distil-whisper-large-v3-en',
];

export const audioModelMenu = new Menu('audioModel');

audioModels.forEach((model) => {
    audioModelMenu.text(model, async (ctx) => {
        const [textModel, audioModel] = setAudioModel(model, ctx.from?.id!);

        await ctx.editMessageText(
            escapeMarkdown(
                `Text model: \`${textModel ?? 'None'}\`\n` +
                `Audio model: \`${audioModel ?? 'None'}\``,
            ),
            { parse_mode: 'MarkdownV2' },
        );
    }).row();
});

audioModelMenu.back('Back');
