// @ts-check

import { client } from "../client.js";

export function getUser(userId) {
  return client.users.cache.get(userId);
}

export class ChangableString {
  /**
   * @type {string}
   */
  string;
  /**
   * @param {string} [stringData]
   */
  constructor(stringData) {
    if (typeof stringData === "string") this.string = stringData;
  }

  /**
   * @param {string} newString
   */
  set(newString) {
    this.string = newString;
  }

  get() {
    return this.string;
  }
}
