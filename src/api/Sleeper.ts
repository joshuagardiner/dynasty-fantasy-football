import { Player } from "../lib/responses/Player";
import { Roster } from "../lib/responses/Roster";
import { getPlayers } from "./cache/Players";

const FORBIDDEN_RESPONSE_PROPERTIES = new Set([
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

export function stripUnwantedFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUnwantedFields(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce(
      (acc, [key, nestedValue]) => {
        if (FORBIDDEN_RESPONSE_PROPERTIES.has(key)) {
          return acc;
        }

        acc[key] = stripUnwantedFields(nestedValue);
        return acc;
      },
      {} as Record<string, unknown>,
    ) as T;
  }

  return value;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Request failed with status: ${response.status} for URL: ${url}`,
    );
  }

  const data = (await response.json()) as T;
  return stripUnwantedFields(data);
}

function mapRostersToPlayers(
  previousSeasonRosters: Roster[],
  rosters: Roster[],
  players: Record<string, Player>,
): any[] {
  return rosters.map((roster) => {
    const previousSettings =
      previousSeasonRosters.find(
        (previousRoster) => previousRoster.owner_id === roster.owner_id,
      )?.settings ?? {};

    return {
      ...roster,
      previousSettings,
      players: (roster.players ?? []).map(
        (id) => players[id] ?? { player_id: id },
      ),
      starters: (roster.starters ?? []).map(
        (id) => players[id] ?? { player_id: id },
      ),
      taxi: (roster.taxi ?? []).map((id) => players[id] ?? { player_id: id }),
    };
  });
}

export async function getLeagueRosters(): Promise<any> {
  const leagueId = process.env.REACT_APP_LEAGUE_ID;
  const previousSeasonLeagueId =
    process.env.REACT_APP_PREVIOUS_SEASON_LEAGUE_ID;
  const [previousSeasonRosters, rosters, players] = await Promise.all([
    fetchJSON<Roster[]>(
      `https://api.sleeper.app/v1/league/${previousSeasonLeagueId}/rosters`,
    ),
    fetchJSON<Roster[]>(
      `https://api.sleeper.app/v1/league/${leagueId}/rosters`,
    ),
    getPlayers(), // Assuming getPlayers is imported from the cache module
  ]);

  return mapRostersToPlayers(previousSeasonRosters, rosters, players);
}
