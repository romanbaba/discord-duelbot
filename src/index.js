// @ts-check
import { CommandHandler, EventHandler } from "djs-bot-base";
import { client } from "./client.js";
import config from "./config.js";

const commands = new CommandHandler({
	slashCommandsDir: "./src/commands",
	suppressWarnings: true,
});
const events = new EventHandler({
	eventsDir: "./src/events",
	suppressWarnings: true,
});

(async () => {
	await commands.setSlashCommands();
	await events.setEvents(client);

	commands.setDefaultSlashHandler(client);

	await client.login(config.token);
	await commands.registerSlashCommands(client);
})();
