// @ts-check
import { ActionRowBuilder, ComponentType } from "discord.js";
import { SlashCommand } from "djs-bot-base";
import { Time, disabledButtons } from "utilscord";
import { v1 } from "uuid";
import config from "../config.js";
import attackRow from "../utils/attack.js";
import {
  closeMatch,
  createMatch,
  getMatch,
  isPlaying,
} from "../utils/duels.js";
import sendLog from "../utils/log.js";
import {
  DeniedEmbed,
  DuelWaitEmbed,
  FirstAttackNoUsed,
  StartEmbed,
  TimeIsOver,
  UnavailableEmbed,
} from "../views/embeds.js";
import { DuelAcceptDenyRow } from "../views/rows.js";

export default new SlashCommand({
  slashCommandData: (builder) =>
    builder
      .setName("düello")
      .setNameLocalization("en-US", "duel")
      .setNameLocalization("en-GB", "duel")
      .setDescription("Etiketlediğin bir kişiye düello isteği atabilirsin.")
      .addUserOption((input) =>
        input
          .setName("rakip")
          .setDescription("Bir rakip seçmen gerekiyor.")
          .setRequired(true),
      )
      .setDMPermission(false),
  async run(interaction) {
    const opponent = interaction.options.getUser("rakip", true);

    const requestCheck =
      isPlaying([opponent.id, interaction.user.id]) ||
      opponent.bot ||
      interaction.user.id === opponent.id;

    if (requestCheck) {
      return await interaction.reply({
        embeds: [UnavailableEmbed(interaction)],
        fetchReply: true,
      });
    }

    const message = await interaction.reply({
      content: `<@${opponent.id}>`,
      embeds: [DuelWaitEmbed(interaction)],
      components: [DuelAcceptDenyRow],
      fetchReply: true,
    });

    /** @param {import("discord.js").ButtonInteraction} i */
    const filter = (i) =>
      i.user.id === opponent.id &&
      i.message.id === message.id &&
      !i.customId.includes("-");
    const collector = message.createMessageComponentCollector({
      filter,
      time: Time.OneMinute,
      componentType: ComponentType.Button,
      max: 1,
    });

    let accepted = false;
    let completed = false;

    collector.once("end", async () => {
      if (accepted || completed) return;

      await interaction.editReply({
        content: "",
        embeds: [TimeIsOver(interaction)],
        components: [disabledButtons(ActionRowBuilder.from(DuelAcceptDenyRow))],
      });
    });

    collector.on("collect", async (i) => {
      const customId = i.customId;
      switch (customId) {
        case "reject": {
          completed = true;

          await i.update({
            content: "",
            embeds: [DeniedEmbed(interaction)],
            components: [disabledButtons(ActionRowBuilder.from(DuelAcceptDenyRow))],
          });
          break;
        }

        case "accept": {
          accepted = true;
          completed = true;

          if (config.superLogs) {
            sendLog({
              content: `**DÜELLO:** <@${interaction.user.id}> ve <@${opponent.id}> bir düello yapıyor.`,
            });
          }

          const roomId = v1();

          createMatch(roomId, {
            messageId: message.id,
            players: [interaction.user.id, opponent.id],
          });

          await i.update({
            content: `**🗣️ Evrenin kaderini belirleyecek maç başladı! İlk eli <@${interaction.user.id}> atıyor.**`,
            embeds: [StartEmbed(i, interaction, opponent)],
            components: attackRow(interaction.user.id),
          });

          const timeout = setTimeout(async () => {
            const newRoom = getMatch(roomId);

            if (!newRoom) return;

            closeMatch(roomId);

            await message.edit({
              content: "",
              embeds: [FirstAttackNoUsed(interaction)],
              components: attackRow(opponent.id).map((button) =>
                disabledButtons(ActionRowBuilder.from(button)),
              ),
            });
            sendLog({
              content: `**DÜELLO:** <@${interaction.user.id}> ve <@${opponent.id}> arasındaki maçta ilk el oynanmadığı için oyun iptal edildi.`,
            });
          }, 15 * 1000);

          const firstCollector = message.createMessageComponentCollector({
            time: 15000,
            max: Infinity,
            filter: (btn) => btn.user.id === interaction.user.id,
          });

          firstCollector.on("collect", () => {
            clearTimeout(timeout);
            firstCollector.stop();
          });
        }
      }
    });
  },
});
