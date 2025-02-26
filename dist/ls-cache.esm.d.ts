export class CacheStorage {
    constructor(prefix?: string);
    prefix: string;
    /**
     * Returns a key of a given string.
     * @param {string} text - The string to encode to key.
     * @returns {string} The hash of the input string.
     */
    getKeyName(text: string): string;
    /**
     * Stores a record in localStorage using a hashed URL as the key.
     *
     * @param {string} url - The URL to be hashed and used as the key for storage.
     * @param {string} value - The value to store in the cache.
     * @param {number} ttl - The time-to-live (in seconds) for the cached record.
     */
    write(url: string, value: string, ttl: number): void;
    /**
     * Retrieves a record from localStorage for a given URL.
     *
     * @param {string} url - The URL to retrieve the record from.
     * @returns {string|null} The value of the record if it exists, otherwise null.
     */
    read(url: string): string | null;
    /**
     * Retrieves a record from localStorage for a given key.
     *
     * @param {string} key - The key to read the record from.
     * @returns {{created: number, expires: number, value: string}|null} The record containing created, expires, and value if all exist, otherwise null.
     */
    readKey(key: string): {
        created: number;
        expires: number;
        value: string;
    } | null;
    /**
     * Stores a record in localStorage with a given ttl.
     *
     * @param {string} key - The key to store the record under.
     * @param {string} value - The value to store.
     * @param {number} ttl - The time (in seconds) the record should be valid.
     */
    setKey(key: string, value: string, ttl: number): void;
    /**
     * Retrieves all keys in the cache.
     * @returns {string[]} An array of all keys in the cache.
     */
    getKeyNames(): string[];
    /**
     * Removes all outdated keys from the cache.
     */
    removeOutdatedKeys(): void;
    /**
     * Removes all records in the cache.
     */
    removeAll(): void;
    /**
     * Removes all records associated with a given key from the cache.
     *
     * @param {string} key - The key to remove records for.
     */
    removeKey(key: string): void;
    /**
     * Removes all records from the cache that were created before a specified date.
     *
     * @param {Date} created_date - The date object representing the date before which records should be removed.
     */
    removeKeysCreatedBefore(created_date: Date): void;
    #private;
}
export const cacheStorageConfig: CacheStorageConfig;
declare class CacheStorageConfig {
    /**
     * The storage object to use for caching.
     * @type {Storage}
     */
    storage: Storage;
    /**
     * The function used to encode keys.
     * @type {(text: string) => string}
     * */
    keyEncoder: (text: string) => string;
}
export {};
