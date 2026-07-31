import { Player } from "../../lib/responses/Player";
import { Cache } from "../../lib/responses/Cache";

const DB_NAME = "sleeper";
const STORE = "cache";
const KEY = "players";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const PLAYERS_URL = "https://api.sleeper.app/v1/players/nfl?active=true";

let memoryCache: Cache | null = null;
let inFlight: Promise<Record<string, Player>> | null = null;

const isFresh = (e: Cache | null | undefined): e is Cache =>
  !!e && Date.now() - e.fetchedAt < TTL_MS;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idb<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = run(db.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function getPlayers(
  force = false,
): Promise<Record<string, Player>> {
  if (!force && isFresh(memoryCache)) {
    return memoryCache.data;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    if (!force) {
      const stored = await idb<Cache | undefined>("readonly", (store) =>
        store.get(KEY),
      ).catch(() => undefined);

      if (isFresh(stored)) {
        memoryCache = stored;
        return stored.data;
      }
    }

    const response = await fetch(PLAYERS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch players: ${response.statusText}`);
    }

    const data: Record<string, Player> = await response.json();
    memoryCache = { fetchedAt: Date.now(), data };
    await idb("readwrite", (store) => store.put(memoryCache, KEY)).catch(
      () => {},
    );

    return data;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}

export function clearPlayersCache(): Promise<void> {
  memoryCache = null;
  return idb("readwrite", (store) => store.delete(KEY))
    .then(() => undefined)
    .catch(() => {});
}
