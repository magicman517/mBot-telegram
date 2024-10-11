import { Bot } from 'https://deno.land/x/grammy@v1.30.0/mod.ts';

export default new Bot(Deno.env.get('BOT_TOKEN')!);
