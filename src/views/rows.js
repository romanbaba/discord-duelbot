import { DuelAcceptButton, DuelDenyButton } from "./buttons.js";
import { ActionRowBuilder } from "discord.js";

/** @type {ActionRowBuilder<import("discord.js").ButtonBuilder>} */
export const DuelAcceptDenyRow = new ActionRowBuilder().setComponents(
  DuelAcceptButton,
  DuelDenyButton,
);
