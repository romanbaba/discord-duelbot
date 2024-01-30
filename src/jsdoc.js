/**
 * @typedef {{
 *  id: string;
 *  hp: number;
 *  poison: boolean;
 *  poisonDuration: number;
 *  status: string;
 *  onDefense: boolean;
 * }} Player
 *
 * @typedef {{
 *  id: string;
 *  order: number;
 *  messageId: string;
 *  players: Player[];
 * }} Room
 *
 * @typedef {{
 *  messageId: string;
 *  players: string[];
 * }} BaseMatchData
 *
 * @typedef {string[]} Players
 */
export {};
