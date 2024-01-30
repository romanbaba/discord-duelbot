import * as fs from "fs";
import { JsonDatabase } from "wio.db";

if (!fs.existsSync("database")) {
	fs.mkdirSync("database");
}

/** @type {JsonDatabase<any>} */
export const gameDB = new JsonDatabase({ databasePath: "database/game" });
