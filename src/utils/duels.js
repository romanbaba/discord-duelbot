// @ts-check
import {
  AdvancedEmbed,
  AdvancedEmbedType,
  disabledButtons,
  randomInt,
} from "utilscord";
import config from "../config.js";
import { gameDB } from "../db.js";
import sendLog from "./log.js";
import attackRow from "./attack.js";
import { getUser } from "./general.js";
import { string } from "sneaks";

/** @type {Map<string, [NodeJS.Timeout, NodeJS.Timeout?]>} */
export const timeouts = new Map();
/** @type {Map<string, string[]>} */
export const afks = new Map();

/**
 * @template {unknown[]} Args
 * @template {unknown} ReturnType
 * @param {string} matchId
 * @param {(matchId: string, ...args: Args) => ReturnType} func
 * @returns {(...args: Args) => ReturnType}
 */
export function useMatchId(matchId, func) {
  return (...args) => func(matchId, ...args);
}

/**
 * @param {string} matchId
 */
export function createDuelComponents(matchId) {
  return {
    getMatch: useMatchId(matchId, getMatch),
    getAllMatches,
    findMatchByPlayerId,
    updatePlayer: useMatchId(matchId, updatePlayer),
    updateMatch: useMatchId(matchId, updateMatch),
    closeMatch: useMatchId(matchId, closeMatch),
    isPlaying,
    getCurrentPlayer: useMatchId(matchId, getCurrentPlayer),
    getNextPlayer: useMatchId(matchId, getNextPlayer),
    getPlayer: useMatchId(matchId, getPlayer),
    getActivePlayers,
    addActivePlayers,
    removeActivePlayers,
    createMatch: useMatchId(matchId, createMatch),
    addHealth: useMatchId(matchId, addHealth),
    leaveMatch: useMatchId(matchId, leaveMatch),
    stopMatch: useMatchId(matchId, stopMatch),
    checkDefenseTimeout: useMatchId(matchId, checkDefenseTimeout),
    attack: useMatchId(matchId, attack),
    ultraAttack: useMatchId(matchId, ultraAttack),
    poison: useMatchId(matchId, poison),
    changeHealths: useMatchId(matchId, changeHealths),
    useShield: useMatchId(matchId, useShield),
    reRenderGame: useMatchId(matchId, reRenderGame),
    finishGame: useMatchId(matchId, finishGame),
    checkForAfk: useMatchId(matchId, checkForAfk),
  };
}

/**
 * @param {string} matchId
 * @returns {import("../jsdoc.js").Room | undefined}
 */
export function getMatch(matchId) {
  return gameDB.get(`rooms.matches.${matchId}`);
}

/**
 * @returns {import("../jsdoc.js").Room[]}
 */
export function getAllMatches() {
  return Object.values(gameDB.get("rooms.matches") ?? {});
}

/**
 * @param {string} playerId
 * @returns {import("../jsdoc.js").Room | undefined}
 */
export function findMatchByPlayerId(playerId) {
  return getAllMatches().find((match) =>
    match.players.find((player) => player.id === playerId),
  );
}

/**
 * @param {string} matchId
 * @param {import("../jsdoc.js").Player} player
 */
export function updatePlayer(matchId, player) {
  const match = getMatch(matchId);

  if (!match) return;

  const { players: oldPlayers } = match;
  const players = oldPlayers.map((pl) => (pl.id === player.id ? player : pl));

  updateMatch(matchId, { players });
}

/**
 * @param {string} matchId
 * @param {{ players: import("../jsdoc.js").Player[], order?: number, incrementOrder?: boolean }} matchData
 */
export function updateMatch(matchId, matchData) {
  const match = getMatch(matchId);

  if (!match) return;

  const { players, incrementOrder = false } = matchData;

  gameDB.set(`rooms.matches.${matchId}`, {
    ...match,
    players,
    order: incrementOrder ? (match.order + 1) % players.length : match.order,
  });
}

/**
 * @param {string} matchId
 */
export function closeMatch(matchId) {
  const match = getMatch(matchId);

  if (!match) return;

  const { players } = match;

  removeActivePlayers(players.map((player) => player.id));
  gameDB.delete(`rooms.matches.${matchId}`);
}

/**
 * @param {string[]} playerIds
 * @returns {boolean}
 */
export function isPlaying(playerIds) {
  const players = getActivePlayers();
  return !!playerIds.find((player) => players.includes(player));
}

/**
 * @param {string} matchId
 * @returns {import("../jsdoc.js").Player | undefined}
 */
export function getCurrentPlayer(matchId) {
  const match = getMatch(matchId);

  if (!match) return;

  const { order, players } = match;
  return players[order];
}

/**
 * @param {string} matchId
 * @returns {import("../jsdoc.js").Player | undefined}
 */
export function getNextPlayer(matchId) {
  const match = getMatch(matchId);

  if (!match) return;

  const { order, players } = match;
  return players[(order + 1) % players.length];
}

/**
 * @param {string} matchId
 * @param {string} playerId
 * @returns {import("../jsdoc.js").Player | undefined}
 */
export function getPlayer(matchId, playerId) {
  const match = getMatch(matchId);
  return match?.players.find((player) => player.id === playerId);
}

/**
 * @returns {string[]}
 */
export function getActivePlayers() {
  return gameDB.get("rooms.players", []);
}

/**
 * @param {string[]} players
 */
export function addActivePlayers(players) {
  const oldPlayers = gameDB.get("rooms.players", []);
  gameDB.set("rooms.players", [...oldPlayers, ...players]);
}

/**
 * @param {string[]} players
 */
export function removeActivePlayers(players) {
  const oldPlayers = gameDB.get("rooms.players", []);
  gameDB.set(
    "rooms.players",
    oldPlayers.filter((player) => !players.includes(player)),
  );
}

/**
 * @param {string} matchId
 * @param {import("../jsdoc.js").BaseMatchData} matchData
 */
export function createMatch(matchId, matchData) {
  const { messageId, players } = matchData;

  /** @type {import("../jsdoc.js").Room} */
  const roomData = {
    id: matchId,
    messageId,
    order: 0,
    players: players.map((player) => ({
      id: player,
      hp: config.globalHP,
      poison: false,
      poisonDuration: 0,
      onDefense: false,
      status: "❤️",
    })),
  };

  addActivePlayers(players);
  gameDB.set(`rooms.matches.${matchId}`, roomData);
}

/**
 * @param {string} matchId
 * @param {string} playerId
 * @returns {number}
 */
export function addHealth(matchId, playerId) {
  const player = getPlayer(matchId, playerId);

  if (!player) return -1;

  const { hp } = player;
  const health = randomInt(config.health.min, config.health.max);

  updatePlayer(matchId, { ...player, hp: hp + health, status: "❤️" });

  if (config.superLogs) {
    sendLog({
      content: `**DÜELLO:** <@${playerId}> kendine **${health} gücünde** can bastı.`,
    });
  }

  return health;
}

/**
 * @param {string} matchId
 * @param {string} playerId
 */
export function leaveMatch(matchId, playerId) {
  const player = getPlayer(matchId, playerId);

  if (!player) return;

  updatePlayer(matchId, { ...player, status: "❤️" });

  if (config.superLogs) {
    sendLog({ content: `**DÜELLO:** <@${playerId}> kaçtı.` });
  }
}

/**
 * @param {string} matchId
 */
export function stopMatch(matchId) {
  closeMatch(matchId);
  const [timeoutData, inlineTimeout] = timeouts.get(matchId) ?? [];

  if (timeoutData) clearTimeout(timeoutData);
  if (inlineTimeout) clearTimeout(inlineTimeout);

  timeouts.delete(matchId);
  afks.delete(matchId);
}

/**
 * @param {string} matchId
 * @param {string} playerId
 */
export function checkDefenseTimeout(matchId, playerId) {
  const player = getPlayer(matchId, playerId);

  if (!player || !player.onDefense) return;

  updatePlayer(matchId, { ...player, onDefense: false, status: "❤️" });

  if (config.superLogs) {
    sendLog({
      content: `**DÜELLO:** <@${playerId}> kalkan süresi doldu.`,
    });
  }
}

/**
 * @param {string} matchId
 */
export function attack(matchId) {
  const attacker = getCurrentPlayer(matchId);
  const attacked = getNextPlayer(matchId);

  if (!attacker || !attacked) return -1;

  const { hp } = attacked;
  const damage = randomInt(config.hit.min, config.hit.max);

  updatePlayer(matchId, { ...attacked, hp: hp - damage, status: "💔" });

  if (config.superLogs) {
    sendLog({
      content: `**DÜELLO:** <@${attacker.id}> <@${attacked.id}> adlı kullanıcya **%${damage} güç** hasar verdi.`,
    });
  }

  return damage;
}

/**
 * @param {string} matchId
 */
export function ultraAttack(matchId) {
  const attacker = getCurrentPlayer(matchId);
  const attacked = getNextPlayer(matchId);

  if (!attacker || !attacked) return;

  const { hp, onDefense } = attacked;
  const baseDamage = randomInt(config.ultrapower.min, config.ultrapower.max);
  const damage = baseDamage * (onDefense ? 0.75 : 1);

  updatePlayer(matchId, { ...attacked, hp: hp - damage, status: "💔" });

  if (config.superLogs) {
    sendLog({
      content: `**DÜELLO:** <@${attacker.id}> <@${attacked.id}> adlı kullanıcya **%${damage} ultra güç** hasar verdi.`,
    });
  }
}

/**
 * @param {string} matchId
 */
export function poison(matchId) {
  const attacker = getCurrentPlayer(matchId);
  const attacked = getNextPlayer(matchId);

  if (!attacker || !attacked) return -1;

  const { hp } = attacked;
  const damage = randomInt(10, 75);

  updatePlayer(matchId, {
    ...attacked,
    hp: hp - damage,
    status: "💚",
    poison: true,
    poisonDuration: config.globalPoisonMaxDuration,
  });

  if (config.superLogs) {
    sendLog({
      content: `**DÜELLO:** <@${attacker.id}> <@${attacked.id}> adlı kullanıcya **%${damage} güç** zehir hasarı verdi.`,
    });
  }

  return damage;
}

/**
 * @param {string} matchId
 */
export function changeHealths(matchId) {
  const attacker = getCurrentPlayer(matchId);
  const attacked = getNextPlayer(matchId);

  if (!attacker || !attacked) return;

  updatePlayer(matchId, { ...attacker, hp: attacked.hp, status: "❤️" });
  updatePlayer(matchId, { ...attacked, hp: attacker.hp, status: "❤️" });

  if (config.superLogs) {
    sendLog({
      content: `**DÜELLO:** <@${attacker.id}> <@${attacked.id}> ile canlarını değiştirdi.`,
    });
  }
}

/**
 * @param {string} matchId
 */
export function useShield(matchId) {
  const player = getCurrentPlayer(matchId);

  if (!player) return;

  updatePlayer(matchId, { ...player, onDefense: true, status: "🛡️" });

  if (config.superLogs) {
    sendLog({
      content: `**DÜELLO:** <@${player.id}> kalkan kullanıyor.`,
    });
  }
}

/**
 * @param {string} matchId
 * @param {import("discord.js").ButtonInteraction} interaction
 * @param {string} content
 * @param {boolean} [isOver = false]
 * @param {import("discord.js").Message} [message]
 */
export async function reRenderGame(
  matchId,
  interaction,
  content,
  isOver = false,
  message,
) {
  const match = getMatch(matchId);

  if (!match) return;

  const attacker = getCurrentPlayer(matchId);
  const attacked = getNextPlayer(matchId);
  const attackedUser = attacked ? getUser(attacked.id) : undefined;

  if (!attacker || !attacked || !attackedUser) return;

  const { players } = match;

  const fields = players
    .map((player) => {
      const user = getUser(player.id);

      if (!user) return { name: "", value: "", inline: true };

      return {
        name: user.displayName,
        value: `Can: **${player.hp} ${player.status}**`,
        inline: true,
      };
    })
    .filter(({ name, value }) => name !== "" && value !== "");

  interaction.user = attackedUser;

  const embedBuilder = new AdvancedEmbed(
    interaction.message.embeds[0]?.data ?? undefined,
  )
    .setInteraction(interaction)
    .setStyle(AdvancedEmbedType.Default, "Düello")
    .setDescription(
      "Maç başladı; 15 saniye içinde atağınızı veya savunmanızı gerçekleştirmezseniz, el karşı tarafa geçer. Eğer her iki taraf da üst üste aynı durumu gerçekleştirirse, maç iptal edilir.",
    )
    .setFields(fields);

  if (message) {
    await message.edit({
      content,
      embeds: [embedBuilder],
      components: isOver
        ? attackRow(attacked.id).map((act) => disabledButtons(act))
        : attackRow(attacked.id),
    });
    return;
  }

  await interaction.update({
    content,
    embeds: [embedBuilder],
    components: isOver
      ? attackRow(attacked.id).map((act) => disabledButtons(act))
      : attackRow(attacked.id),
  });
}

/**
 * @param {string} matchId
 * @param {import("discord.js").ButtonInteraction} interaction
 */
export async function finishGame(matchId, interaction) {
  const match = getMatch(matchId);

  if (!match) return false;

  const { players: oldPlayers } = match;
  const players = oldPlayers.map((player) => {
    const { hp } = player;
    const newPlayer = hp <= 0 ? { ...player, hp: 0, status: "☠️" } : player;
    return newPlayer;
  });

  updateMatch(matchId, { players });
  const winners = players.filter((player) => player.hp > 0);
  const [winner] = winners;

  if (!winner || winners.length !== 1) return false;

  await reRenderGame(
    matchId,
    interaction,
    string.replace(config.messages.win, [winner.id]),
    true,
  );
  stopMatch(matchId);

  const playerIds = players.map((player) => `<@${player.id}>`).join(", ");

  if (config.superLogs) {
    sendLog({
      content: `**DÜELLO:** ${playerIds} kişileri arasındaki maçta <@${winner.id}> **kazandı.**`,
    });
  }

  return true;
}

/**
 * @param {string} matchId
 * @param {import("discord.js").ButtonInteraction} interaction
 */
export async function checkForAfk(matchId, interaction) {
  const current = getCurrentPlayer(matchId);

  if (!current) return;

  const afkList = afks.get(matchId) ?? [];
  const lastValue = afkList.filter((user) => user !== current.id);

  if (!lastValue.length) {
    afks.delete(matchId);
  } else {
    afks.set(matchId, lastValue);
  }

  const newTimeout = setTimeout(async () => {
    const currentPlayer = getCurrentPlayer(matchId);
    const nextPlayer = getNextPlayer(matchId);
    const currentMatch = getMatch(matchId);

    if (!currentPlayer || !currentMatch || !nextPlayer) return;

    const tempAfk = afks.get(matchId) ?? [];
    afks.set(matchId, [...tempAfk, currentPlayer.id]);

    const afk = afks.get(matchId) ?? [];

    if (afk.length >= 2) {
      await interaction.message
        .edit({
          content: config.messages.cancel,
          components: attackRow(currentPlayer.id).map((act) =>
            disabledButtons(act),
          ),
        })
        .catch(() => undefined);

      return stopMatch(matchId);
    }

    updateMatch(matchId, {
      incrementOrder: true,
      players: currentMatch.players,
    });

    await interaction.message
      .edit({
        content: string.replace(config.messages.timeout, [nextPlayer.id]),
        components: attackRow(nextPlayer.id),
      })
      .catch(() => undefined);

    const secondTimeout = setTimeout(async () => {
      await interaction.message
        .edit({
          content: config.messages.cancel,
          components: attackRow(nextPlayer.id).map((act) =>
            disabledButtons(act),
          ),
        })
        .catch(() => undefined);

      return stopMatch(matchId);
    }, 15 * 1000);

    timeouts.set(currentMatch.id, [newTimeout, secondTimeout]);
  }, 15 * 1000);
  const [oldTimeout, inlineTimeout] = timeouts.get(matchId) ?? [];

  if (oldTimeout) clearTimeout(oldTimeout);
  if (inlineTimeout) clearTimeout(inlineTimeout);

  timeouts.set(matchId, [newTimeout]);
}
