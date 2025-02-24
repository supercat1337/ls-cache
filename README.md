# CacheStorage

A simple library to store and retrieve data in `localStorage` using a hashed URL as the key.

## Features

- Store and retrieve data in `localStorage` using a hashed URL as the key.
- Set a time-to-live (TTL) for cached data.
- Wait for the TTL to expire before removing the cached data.
- You can use your own hash function or localStorage object.
- You can remove all old keys from the cache based on a given date.

## Installation

You can install the library using npm:
```bash
npm install @supercat1337/ls-cache
```

## Usage

```js
import { CacheStorage } from '@supercat1337/ls-cache';

  const cache = new CacheStorage();

  // Write a value to the cache
  cache.write("https://example.com", "Hello, world!", 1);

  // Read a value from the cache
  const value = cache.read("https://example.com");
  console.log(value);
  // Output: "Hello, world!"

  // Wait for the cache to expire
  await sleep(2000);
  console.log(value);
  // Output: null
```

## CacheStorage Methods
Here are the methods available in the `CacheStorage` class:

- `write(url, value, ttl)`: Writes a value to the cache.
- `read(url)`: Reads a value from the cache. Returns `null` if the value is not found.
- `readKey(key)`: Reads a value from the cache. Key is the hashed URL. Returns `null` if the value is not found. 
- `setKey(key, value, ttl)`: Writes a value to the cache. Key is the hashed URL. key is the hashed URL. value is the value to write. ttl is the time-to-live in seconds.
- `readKey(key)`: Reads a value from the cache. Key is the hashed URL. Returns object with start, end, and value if all exist, otherwise null.
- `getKeys()`: Returns an array of all keys in the cache.
- `removeAll()`: Removes all records in the cache.
- `removeKey(key)`: Removes all records associated with a given key from the cache.
- `removeOldKeys(date)`: Removes all records from the cache that were created before a specified date. 
- `getHash(text)`: Returns a base-36 hash of a given string. 

## cacheStorageConfig Object

cacheStorageConfig is a global object that can be used to configure the library.
You can use your own hash function or localStorage object.

```js
import { CacheStorage, cacheStorageConfig } from '@supercat1337/ls-cache';
import { Window } from "happy-dom";

cacheStorageConfig.window = new Window({ url: "https://localhost:8080" });
cacheStorageConfig.hash = (text) => {
    // Your own hash function
    return text;
}
```

## License

This library is released under the [MIT License](https://github.com/supercat1337/ls-cache/blob/main/LICENSE).
