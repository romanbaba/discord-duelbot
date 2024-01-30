// @ts-check

import { client } from "../client.js";
import config from "../config.js";

/** @param {import("discord.js").MessageCreateOptions} options */
const sendLog = (options) => {
  const channel = client.channels.cache.get(config.channelId);
  if (!(channel && channel.isTextBased())) return;

  channel.send(options);
};

export default sendLog;
