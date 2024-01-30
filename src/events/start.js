// @ts-check
import { ActivityType } from "discord.js";
import { Event } from "djs-bot-base";
import { console } from "sneaks";
import { gameDB } from "../db.js";

export default new Event({
  categoryName: "ready",
  async run(bot) {
    bot.user.setActivity({
      name: "romanbaba",
      state: "🌟 github.com/romanbaba",
      type: ActivityType.Custom,
    });

    gameDB.set("rooms", { players: [], matches: {} });
    console.success("Bot başarıyla Discord'a giriş yaptı.");
  },
});
