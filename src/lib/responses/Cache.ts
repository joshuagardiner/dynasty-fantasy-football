import { Player } from "./Player";

export type Cache = {
  fetchedAt: number;
  data: Record<string, Player>;
};
