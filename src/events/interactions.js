// @ts-check
import { Event } from "djs-bot-base";
import { string } from "sneaks";
import { disabledButtons, randomInt } from "utilscord";
import config from "../config.js";
import { areYouSureAboutRunningAwayRow } from "../utils/attack.js";
import { createDuelComponents, findMatchByPlayerId } from "../utils/duels.js";
import { ChangableString } from "../utils/general.js";
import { generateId } from "../utils/id.js";
import sendLog from "../utils/log.js";

export default new Event({
  categoryName: "interactionCreate",
  async run(interaction) {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;

    if (!customId.includes("-")) return;

    const match = findMatchByPlayerId(interaction.user.id);
    if (!match) return;

    /**
     * @param {string} id
     */
    const getId = (id) => generateId(id, interaction.user.id);

    const {
      addHealth,
      attack,
      changeHealths,
      checkDefenseTimeout,
      finishGame,
      getCurrentPlayer,
      getMatch,
      getNextPlayer,
      leaveMatch,
      poison,
      reRenderGame,
      stopMatch,
      ultraAttack,
      updateMatch,
      useShield,
      checkForAfk,
    } = createDuelComponents(match.id);

    switch (customId) {
      case getId("run"): {
        return await interaction.reply({
          content: string.replace(
            config.messages.areYouSureAboutRunningAwayRow,
            [interaction.user.id],
          ),
          components: areYouSureAboutRunningAwayRow(interaction.user.id),
          ephemeral: true,
        });
      }

      case getId("yes"): {
        const message = interaction.channel?.messages.cache.get(
          match.messageId,
        );

        if (!message) return;

        leaveMatch(interaction.user.id);

        if (config.superLogs) {
          sendLog({
            content: `**DÜELLO:** <@${interaction.user.id}> oyundan kaçtı ve maç berabere kaldı.`,
          });
        }

        await reRenderGame(
          interaction,
          string.replace(config.messages.esc, [interaction.user.id]),
          true,
          message,
        );

        stopMatch();
        return await interaction.update({
          components: areYouSureAboutRunningAwayRow(interaction.user.id).map(
            (button) => disabledButtons(button),
          ),
        });
      }

      case getId("no"): {
        return await interaction
          .update({
            components: areYouSureAboutRunningAwayRow(interaction.user.id).map(
              (button) => disabledButtons(button),
            ),
          })
          .catch(() => undefined);
      }
    }

    const current = getCurrentPlayer();

    if (!current) return;

    if (current.id !== interaction.user.id) {
      return interaction.reply({
        content: "Sıra sizde değil!",
        ephemeral: true,
      });
    }

    const { players: oldPlayers } = match;
    const players = oldPlayers.map((player) => {
      const { poisonDuration, poison: isPoisoned, hp } = player;
      const power = randomInt(10, 75);

      const newPlayer =
        isPoisoned && poisonDuration >= -1
          ? {
              ...player,
              poisonDuration: poisonDuration - 1,
              hp: hp - power,
              status: "💚",
            }
          : {
              ...player,
              poison: false,
              poisonDuration: 0,
            };

      return newPlayer;
    });

    updateMatch({ players });

    const possibility = Math.random();
    const attacked = getNextPlayer();

    if (!attacked) {
      return interaction.reply({
        content:
          "Kritik bir hata oluştu (saldırılacak bulunamadı) lütfen hatayı bildiriniz.",
      });
    }

    updateMatch({ players });
    checkDefenseTimeout(current.id);
    const renderMessage = new ChangableString();

    switch (customId) {
      case getId("thump"): {
        if (attacked.onDefense) {
          checkDefenseTimeout(attacked.id);
          renderMessage.set(
            string.replace(config.messages.thumpIgnore, [attacked.id]),
          );
          break;
        }

        const damage = attack();
        renderMessage.set(
          string.replace(config.messages.thump(damage), [attacked.id]),
        );
        break;
      }

      case getId("ultra-power"): {
        if (possibility > config.possibility.ultrapower) {
          renderMessage.set(
            string.replace(config.messages.ultraIgnore, [attacked.id]),
          );
          break;
        }

        ultraAttack();
        renderMessage.set(
          string.replace(config.messages.ultra(attacked.onDefense), [
            attacked.id,
          ]),
        );
        break;
      }

      case getId("poison"): {
        if (possibility > config.possibility.poison) {
          renderMessage.set(
            string.replace(config.messages.poisonIgnore, [attacked.id]),
          );
          break;
        }

        const poisonDamage = poison();
        renderMessage.set(
          string.replace(config.messages.poison(poisonDamage), [attacked.id]),
        );
        break;
      }

      case getId("swap"): {
        if (possibility > config.possibility.swap) {
          renderMessage.set(
            string.replace(config.messages.swapIgnore, [attacked.id]),
          );
          break;
        }

        changeHealths();
        renderMessage.set(string.replace(config.messages.swap, [attacked.id]));
        break;
      }

      case getId("shield"): {
        if (possibility > config.possibility.shield) {
          renderMessage.set(
            string.replace(config.messages.shieldIgnore, [attacked.id]),
          );
          break;
        }

        useShield();
        renderMessage.set(
          string.replace(config.messages.shield, [attacked.id]),
        );
        break;
      }

      case getId("boost"): {
        if (possibility > config.possibility.health) {
          renderMessage.set(
            string.replace(config.messages.healthIgnore, [attacked.id]),
          );
          break;
        }

        const life = addHealth(current.id);
        renderMessage.set(
          string.replace(config.messages.boost(life), [attacked.id]),
        );
        break;
      }
    }

    const checkGame = await finishGame(interaction);

    if (checkGame) return;

    await reRenderGame(interaction, renderMessage.get());
    updateMatch({ incrementOrder: true, players: getMatch()?.players ?? [] });
    await checkForAfk(interaction);
  },
});
