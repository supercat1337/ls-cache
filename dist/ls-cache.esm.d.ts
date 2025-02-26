export class CacheStorage {
    constructor(prefix?: string);
    prefix: string;
    /**
     * Returns a base-36 hash of a given string.
     * @param {string} text - The string to hash.
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
     * @returns {{start: number, end: number, value: string}|null} The record containing start, end, and value if all exist, otherwise null.
     */
    readKey(key: string): {
        start: number;
        end: number;
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
     * @param {Date} date - The date (in milliseconds since the Unix epoch) before which records should be removed.
     */
    removeOldKeys(date: Date): void;
    #private;
}
export namespace cacheStorageConfig {
    export let window: any;
    export { hash };
}
/**
 * Generates a simple hash from a given string.
 * https://gist.github.com/jlevy/c246006675becc446360a798e2b2d781
 *
 * @param {string} str - The input string to hash.
 * @returns {string} A base-36 string representation of the hash.
 */
declare function hash(str: string): string;
export {};
