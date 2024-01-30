// @ts-check
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { generateId as gen } from "./id.js";

/** @param {string} userId  */
export default function attackRow(userId) {
  /** @param {string} id */
  const generateId = (id) => gen(id, userId);

  /** @type {ActionRowBuilder<ButtonBuilder>} */
  const attackRows = new ActionRowBuilder();
  attackRows.setComponents(
    new ButtonBuilder()
      .setCustomId(generateId("thump"))
      .setLabel("Saldır")
      .setEmoji({ id: "1198291208968093870" })
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(generateId("ultra-power"))
      .setLabel("Ultra güç")
      .setEmoji({ id: "1198293680876961952" })
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(generateId("poison"))
      .setLabel("Zehir")
      .setEmoji({ id: "1198290130910330960" })
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(generateId("shield"))
      .setLabel("Kalkan")
      .setEmoji({ id: "1198290402306949160" })
      .setStyle(ButtonStyle.Secondary),
  );

  /** @type {ActionRowBuilder<ButtonBuilder>} */
  const escapeRow = new ActionRowBuilder();
  escapeRow.setComponents(
    new ButtonBuilder()
      .setCustomId(generateId("swap"))
      .setLabel("Takas")
      .setEmoji({ id: "1198290752728486079" })
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(generateId("boost"))
      .setLabel("Yemek")
      .setEmoji({ id: "1198344524628504606" })
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(generateId("run"))
      .setLabel("Kaç")
      .setEmoji({ id: "1193984055897755680" })
      .setStyle(ButtonStyle.Danger),
  );

  return [attackRows, escapeRow];
}

/** @param {string} userId  */
export function areYouSureAboutRunningAwayRow(userId) {
  /** @param {string} id */
  const generateId = (id) => gen(id, userId);

  /** @type {ActionRowBuilder<ButtonBuilder>} */
  const attackRows = new ActionRowBuilder();
  attackRows.setComponents(
    new ButtonBuilder()
      .setCustomId(generateId("yes"))
      .setLabel("Evet")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(generateId("no"))
      .setLabel("Hayır")
      .setStyle(ButtonStyle.Danger),
  );

  return [attackRows];
}
