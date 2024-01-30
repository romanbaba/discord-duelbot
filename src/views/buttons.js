import { ButtonStyle, ButtonBuilder } from "discord.js";

export const DuelAcceptButton = new ButtonBuilder()
	.setCustomId("accept")
	.setLabel("Kabul et")
	.setStyle(ButtonStyle.Success);

export const DuelDenyButton = new ButtonBuilder()
	.setCustomId("reject")
	.setLabel("Reddet")
	.setStyle(ButtonStyle.Danger);
