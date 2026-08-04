import { Player } from "../../lib/responses/Player";
import { Cache } from "../../lib/responses/Cache";

const DB_NAME = "sleeper";
const STORE = "cache";
const KEY = "players";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const PLAYERS_URL = "https://api.sleeper.app/v1/players/nfl?active=true";
const FORBIDDEN_PLAYER_PROPERTIES = new Set([
  "co_owners",
  "keepers",
  "metadata",
  "player_map",
  "birth_city",
  "high_school",
  "birth_country",
  "injury_body_part",
  "team_changed_at",
  "sport",
  "rotowire_id",
  "gsis_id",
  "kalshi_id",
  "espn_id",
  "team_abbr",
  "news_updated",
  "injury_start_date",
  "stats_id",
  "practice_description",
  "yahoo_id",
  "sportradar_id",
  "birth_state",
  "competitions",
  "search_rank",
  "search_last_name",
  "swish_id",
  "oddsjam_id",
  "injury_notes",
  "player_shard",
  "pandascore_id",
  "practice_participation",
  "rotoworld_id",
  "opta_id",
]);

function sanitizePlayerRecord(
  data: Record<string, Player>,
): Record<string, Player> {
  return Object.fromEntries(
    Object.entries(data).map(([playerId, player]) => [
      playerId,
      Object.fromEntries(
        Object.entries(player as Record<string, unknown>).filter(
          ([key]) => !FORBIDDEN_PLAYER_PROPERTIES.has(key),
        ),
      ) as Player,
    ]),
  ) as Record<string, Player>;
}

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
    const sanitizedData = sanitizePlayerRecord(memoryCache.data);
    memoryCache = { ...memoryCache, data: sanitizedData };
    return sanitizedData;
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
        const sanitizedData = sanitizePlayerRecord(stored.data);
        memoryCache = { ...stored, data: sanitizedData };
        return sanitizedData;
      }
    }

    const response = await fetch(PLAYERS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch players: ${response.statusText}`);
    }

    const data: Record<string, Player> = await response.json();
    const sanitizedData = sanitizePlayerRecord(data);
    memoryCache = { fetchedAt: Date.now(), data: sanitizedData };
    await idb("readwrite", (store) => store.put(memoryCache, KEY)).catch(
      () => {},
    );

    return sanitizedData;
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
