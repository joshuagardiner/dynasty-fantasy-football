export type Roster = {
  roster_id: string;
  owner_id: string;
  players: string[];
  starters: string[];
  taxi: string[];
  settings?: Record<string, unknown>;
};
