// @ts-check

/**
 * Generates a simple hash from a given string.
 * https://gist.github.com/jlevy/c246006675becc446360a798e2b2d781
 *
 * @param {string} str - The input string to hash.
 * @returns {string} A base-36 string representation of the hash.
 */
function hash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

class CacheStorage {
  prefix = "cache";
  #ls;

  constructor(prefix = "cache") {
    this.#ls = cacheStorageConfig.window.localStorage;

    if (!this.#ls) {
      throw new Error("localStorage is undefined");
    }

    this.prefix = prefix;
  }

  /**
   * Returns a base-36 hash of a given string.
   * @param {string} text - The string to hash.
   * @returns {string} The hash of the input string.
   */
  getKeyName(text) {
    return cacheStorageConfig.hash(text);
  }

  /**
   * Stores a record in localStorage using a hashed URL as the key.
   *
   * @param {string} url - The URL to be hashed and used as the key for storage.
   * @param {string} value - The value to store in the cache.
   * @param {number} ttl - The time-to-live (in seconds) for the cached record.
   */
  write(url, value, ttl) {
    let key = this.getKeyName(url);
    this.setKey(key, value, ttl);
  }

  /**
   * Retrieves a record from localStorage for a given URL.
   *
   * @param {string} url - The URL to retrieve the record from.
   * @returns {string|null} The value of the record if it exists, otherwise null.
   */
  read(url) {
    let key = this.getKeyName(url);
    let keyData = this.readKey(key);
    if (keyData === null) {
      return null;
    }

    let now = Math.ceil(Date.now() / 1000);
    if (now > keyData.end) {
      this.removeKey(key);
      return null;
    }

    return keyData.value;
  }

  /**
   * Retrieves a record from localStorage for a given key.
   *
   * @param {string} key - The key to read the record from.
   * @returns {{start: number, end: number, value: string}|null} The record containing start, end, and value if all exist, otherwise null.
   */
  readKey(key) {
    let start_str = this.#ls.getItem(`${this.prefix}.${key}.start`);
    let end_str = this.#ls.getItem(`${this.prefix}.${key}.end`);
    let value = this.#ls.getItem(`${this.prefix}.${key}.value`);

    if (start_str === null || end_str === null || value === null) {
      return null;
    }

    let start = parseInt(start_str);
    let end = parseInt(end_str);

    if (isNaN(start) || isNaN(end)) {
      this.#ls.removeItem(`${this.prefix}.${key}.start`);
      this.#ls.removeItem(`${this.prefix}.${key}.end`);
      this.#ls.removeItem(`${this.prefix}.${key}.value`);
      return null;
    }

    return { start, end, value };
  }

  /**
   * Stores a record in localStorage with a given ttl.
   *
   * @param {string} key - The key to store the record under.
   * @param {string} value - The value to store.
   * @param {number} ttl - The time (in seconds) the record should be valid.
   */
  setKey(key, value, ttl) {
    let now = Math.ceil(Date.now() / 1000);
    let expiration = now + ttl;

    this.#ls.setItem(`${this.prefix}.${key}.start`, now.toString());
    this.#ls.setItem(`${this.prefix}.${key}.end`, expiration.toString());
    this.#ls.setItem(`${this.prefix}.${key}.value`, value);
  }

  /**
   * Retrieves all keys in the cache.
   * @returns {string[]} An array of all keys in the cache.
   */
  getKeyNames() {
    /** @type {Set<string>} */
    let keys = new Set();

    for (let i = 0; i < this.#ls.length; i++) {
      let key = this.#ls.key(i);
      if (key && key.startsWith(`${this.prefix}.`)) {
        let k = key.replace(`${this.prefix}.`, "").split(".")[0];

        keys.add(k);
      }
    }

    let filteredKeys = [];
    keys.forEach((key) => {
      let keyData = this.readKey(key);
      if (keyData !== null) {
        filteredKeys.push(key);
      }
    });

    return filteredKeys;
  }

  /**
   * Removes all records in the cache.
   */
  removeAll() {
    for (let i = 0; i < this.#ls.length; i++) {
      let key = this.#ls.key(i);
      if (key && key.startsWith(`${this.prefix}.`)) {
        this.#ls.removeItem(key);
      }
    }
  }

  /**
   * Removes all records associated with a given key from the cache.
   *
   * @param {string} key - The key to remove records for.
   */
  removeKey(key) {
    this.#ls.removeItem(`${this.prefix}.${key}.start`);
    this.#ls.removeItem(`${this.prefix}.${key}.end`);
    this.#ls.removeItem(`${this.prefix}.${key}.value`);
  }

  /**
   * Removes all records from the cache that were created before a specified date.
   *
   * @param {Date} date - The date (in milliseconds since the Unix epoch) before which records should be removed.
   */
  removeOldKeys(date) {
    let timestamp = Math.ceil(date.getTime() / 1000);

    for (let i = 0; i < this.#ls.length; i++) {
      let key = this.#ls.key(i);
      if (key && key.startsWith(`${this.prefix}.`)) {
        let k = key.replace(`${this.prefix}.`, "").split(".")[0];
        let keyData = this.readKey(k);
        if (keyData !== null && keyData.start < timestamp) {
          this.removeKey(k);
        }
      }
    }
  }
}

const cacheStorageConfig = {
  /** @type {*} */
  window: globalThis,
  hash : hash,
};

export { CacheStorage, cacheStorageConfig };
