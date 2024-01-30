// @ts-check
import { Client, Partials } from "discord.js";
export const client = new Client({
	intents: ["MessageContent", "GuildMessages", "Guilds", "DirectMessages"],
	partials: [Partials.User, Partials.Channel, Partials.Message],
});
