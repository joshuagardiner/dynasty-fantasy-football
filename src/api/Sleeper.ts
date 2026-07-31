import { Player } from "../lib/responses/Player";
import { Roster } from "../lib/responses/Roster";
import { getPlayers } from "./cache/Players";

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Request failed with status: ${response.status} for URL: ${url}`,
    );
  }
  return response.json() as Promise<T>;
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
