import { Menu } from 'https://deno.land/x/grammy_menu/mod.ts';
import { textModelMenu } from './textModelsMenu.ts';
import { audioModelMenu } from './audioModelsMenu.ts';

export const settingsMenu = new Menu('settings')
	.submenu('Set Text Model', 'textModel').row()
	.submenu('Set Audio Model', 'audioModel');

settingsMenu.register(textModelMenu);
settingsMenu.register(audioModelMenu);
