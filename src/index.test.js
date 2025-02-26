// @ts-check

import { CacheStorage, cacheStorageConfig } from "./index.js";
import test from "ava";
import { Window } from "happy-dom";

/**
 * A simple function that resolves a promise after a given amount of milliseconds.
 * @param {number} ms - The time to wait in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the specified time.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const window = new Window({ url: "https://localhost:8080" });

test("CacheStorage error", (t) => {
  t.throws(() => {
    // @ts-ignore
    cacheStorageConfig.storage = undefined;
    new CacheStorage();
  });
  cacheStorageConfig.storage = window.localStorage;
});

cacheStorageConfig.storage = window.localStorage;

test("CacheStorage (write, read)", async (t) => {
  await sleep(2000);

  const cache = new CacheStorage();

  t.is(typeof cache, "object");
  cache.write("https://example.com", "Hello, world!", 1);

  const value = cache.read("https://example.com");
  t.is(value, "Hello, world!");
  await sleep(2000);
  t.is(cache.read("https://example.com"), null);
});

test("CacheStorage (getKeyName, readKey)", (t) => {
  const cache = new CacheStorage();

  let key = cache.getKeyName("https://example.com");
  cache.write("https://example.com", "Hello, world!", 1);
  let keyData = cache.readKey(key);

  if (keyData === null) {
    t.fail();
  }

  if (keyData) t.is(keyData.value, "Hello, world!");

  const value = cache.read("https://example.com");
  t.is(value, "Hello, world!");
});

test("CacheStorage (removeKey)", (t) => {
  const cache = new CacheStorage();

  let url = "https://example123.com";
  let key = cache.getKeyName(url);
  cache.write(url, "Hello, world!", 1);
  cache.removeKey(key);

  let value = cache.read(url);
  t.is(value, null);
});

test("CacheStorage (readKey with wrong timestamps)", (t) => {
  const cache = new CacheStorage();
  let url = "https://example312.com";

  let key = cache.getKeyName(url);

  cacheStorageConfig.storage.setItem(
    cache.prefix + "." + key + ".value",
    "Hello, world!"
  );

  cacheStorageConfig.storage.setItem(
    cache.prefix + "." + key + ".created",
    "Hello, world!"
  );

  cacheStorageConfig.storage.setItem(
    cache.prefix + "." + key + ".expires",
    "Hello, world!"
  );

  let keyData = cache.readKey(key);

  cache.setKey(key, "Hello, world!", 1);
  cacheStorageConfig.storage.removeItem(
    cache.prefix + "." + key + ".value"
  );

  keyData = cache.readKey(key);
  t.is(keyData, null);
});

test("CacheStorage (getKeyNames, removeAll)", (t) => {
  const cache = new CacheStorage();

  cacheStorageConfig.storage.clear();
  cacheStorageConfig.storage.setItem("foo", "bar");

  cache.write("https://example9.com", "Hello, world!", 1);
  cache.write("https://example8.com", "Hello, world!", 1);

  let keys = cache.getKeyNames();

  let keysArray = Array.from(keys);

  t.is(keys.length, 2);
  cache.removeKey(keysArray[0]);

  keys = cache.getKeyNames();
  t.is(keys.length, 1);

  keysArray = Array.from(keys);
  cache.removeKey(keysArray[0]);

  keys = cache.getKeyNames();
  t.is(keys.length, 0);

  cache.write("https://example9.com", "Hello, world!", 1);
  cache.write("https://example8.com", "Hello, world!", 1);

  keys = cache.getKeyNames();
  t.is(keys.length, 2);

  cache.removeAll();
  keys = cache.getKeyNames();
  t.is(keys.length, 0);
});

test("CacheStorage (removeKeysCreatedBefore)", (t) => {
  const cache = new CacheStorage();

  cacheStorageConfig.storage.clear();

  let url = "https://example314.com";

  let key = cache.getKeyName(url);

  cacheStorageConfig.storage.setItem(
    cache.prefix + "." + key + ".value",
    "Hello, world!"
  );

  cacheStorageConfig.storage.setItem(
    cache.prefix + "." + key + ".created",
    "0"
  );

  let now = Math.ceil(Date.now() / 1000);

  cacheStorageConfig.storage.setItem(
    cache.prefix + "." + key + ".expires",
    (now + 1).toString()
  );

  cache.removeKeysCreatedBefore(new Date());

  let value = cache.read(url);
  t.is(value, null);
});

test("CacheStorage (removeOutdatedKeys)", (t) => {
  const cache = new CacheStorage("test");

  cache.write("https://example314.com", "Hello, world!", 1);
  cache.write("https://example315.com", "Hello, world!", 1);

  let keys = cache.getKeyNames();
  t.is(keys.length, 2);

  setTimeout(() => {
    cache.removeOutdatedKeys();
    keys = cache.getKeyNames();
    t.is(keys.length, 0);
  }, 2000);
  
});