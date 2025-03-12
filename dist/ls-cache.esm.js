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
  /** @type {Storage} */
  #storage;

  constructor(prefix = "cache") {
    this.prefix = prefix;
    this.#storage = cacheStorageConfig.storage;

    if (!this.#storage) {
      throw new Error("storage is undefined");
    }

    const k = "test." + Date.now();
    
    try {
      this.#storage.setItem(k, k);
      this.#storage.removeItem(k);
    } catch (e) {
      throw new Error("storage is not available");
    }
  }

  /**
   * Returns a key of a given string.
   * @param {string} text - The string to encode to key.
   * @returns {string} The hash of the input string.
   */
  getKeyName(text) {
    return cacheStorageConfig.keyEncoder(text);
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

    return keyData.value;
  }

  /**
   * Retrieves a record from localStorage for a given key.
   *
   * @param {string} key - The key to read the record from.
   * @returns {{created: number, expires: number, value: string}|null} The record containing created, expires, and value if all exist, otherwise null.
   */
  readKey(key) {
    let created_str = this.#storage.getItem(`${this.prefix}.${key}.created`);
    let created = parseInt(created_str);

    if (isNaN(created)) {
      this.removeKey(key);
      return null;
    }

    let expires_str = this.#storage.getItem(`${this.prefix}.${key}.expires`);
    let expires = parseInt(expires_str);

    if (isNaN(expires)) {
      this.removeKey(key);
      return null;
    }

    let value = this.#storage.getItem(`${this.prefix}.${key}.value`);
    if (value === null) {
      this.removeKey(key);
      return null;
    }

    let now = Math.ceil(Date.now() / 1000);
    if (now > expires) {
      this.removeKey(key);
      return null;
    }

    return { created, expires, value };
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

    this.#storage.setItem(`${this.prefix}.${key}.created`, now.toString());
    this.#storage.setItem(
      `${this.prefix}.${key}.expires`,
      expiration.toString()
    );
    this.#storage.setItem(`${this.prefix}.${key}.value`, value);
  }

  /**
   * Retrieves all keys in the cache.
   * @returns {string[]} An array of all keys in the cache.
   */
  getKeyNames() {
    /** @type {Set<string>} */
    let keys = new Set();

    for (let i = 0; i < this.#storage.length; i++) {
      let key = this.#storage.key(i);
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
   * Removes all outdated keys from the cache.
   */
  removeOutdatedKeys() {
    this.getKeyNames();
  }

  /**
   * Removes all records in the cache.
   */
  removeAll() {
    for (let i = 0; i < this.#storage.length; i++) {
      let key = this.#storage.key(i);
      if (key && key.startsWith(`${this.prefix}.`)) {
        this.#storage.removeItem(key);
      }
    }
  }

  /**
   * Removes all records associated with a given key from the cache.
   *
   * @param {string} key - The key to remove records for.
   */
  removeKey(key) {
    this.#storage.removeItem(`${this.prefix}.${key}.created`);
    this.#storage.removeItem(`${this.prefix}.${key}.expires`);
    this.#storage.removeItem(`${this.prefix}.${key}.value`);
  }

  /**
   * Removes all records from the cache that were created before a specified date.
   *
   * @param {Date} created_date - The date object representing the date before which records should be removed.
   */
  removeKeysCreatedBefore(created_date) {
    let timestamp = Math.ceil(created_date.getTime() / 1000);

    for (let i = 0; i < this.#storage.length; i++) {
      let key = this.#storage.key(i);
      if (key && key.startsWith(`${this.prefix}.`)) {
        let k = key.replace(`${this.prefix}.`, "").split(".")[0];
        let keyData = this.readKey(k);
        if (keyData !== null && keyData.created < timestamp) {
          this.removeKey(k);
        }
      }
    }
  }
}

class CacheStorageConfig {
  /**
   * The storage object to use for caching.
   * @type {Storage}
   */
  storage = globalThis.localStorage;

  /**
   * The function used to encode keys.
   * @type {(text: string) => string}
   * */
  keyEncoder = hash;
}

const cacheStorageConfig = new CacheStorageConfig();

export { CacheStorage, cacheStorageConfig };
