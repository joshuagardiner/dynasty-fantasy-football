import { Player } from "./responses/Player";

export interface LeagueRoster {
  roster_id: string;
  owner_id: string;
  players: Player[];
  starters: Player[];
  previousSettings?: Record<string, number>;
}
