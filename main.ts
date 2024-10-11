import 'jsr:@std/dotenv/load';
import bot from './clients/bot.ts';
import { startHandler } from './handlers/start.ts';
import { textHandler } from './handlers/text.ts';
import { clearHandler } from './handlers/clear.ts';
import { audioHandler } from './handlers/audio.ts';
import { settingsHandler } from './handlers/settings.ts';
import { settingsMenu } from './menus/settingsMenu.ts';

if (Deno.env.get('BOT_TOKEN') === undefined) {
	console.error('BOT_TOKEN is not set');
	Deno.exit(1);
}

if (Deno.env.get('GROQ_API_KEY') === undefined) {
	console.error('GROQ_API_KEY is not set');
	Deno.exit(1);
}

if (import.meta.main) {
	console.clear();

	await bot.init()
		.then(() => {
			console.log(
				`%cLogged in!\nName: ${bot.botInfo.first_name}\nId: ${bot.botInfo.id}`,
				'color: green',
			);
		})
		.catch(() => {
			console.error(
				'%cFailed to start bot. Please check your BOT_TOKEN',
				'color: red',
			);
			Deno.exit(1);
		});

	bot.use(settingsMenu); // menus/settingsMenu.ts
	bot.use(startHandler); // handlers/start.ts
	bot.use(settingsHandler); // handlers/settings.ts
	bot.use(clearHandler); // handlers/clear.ts
	bot.use(textHandler); // handlers/text.ts
	bot.use(audioHandler); // handlers/audio.ts

	// catch errors so process doesn't end and keep console clean
	bot.catch(() => {});

	bot.start();
}
