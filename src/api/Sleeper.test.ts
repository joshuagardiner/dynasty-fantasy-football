import { stripUnwantedFields } from "./Sleeper";

describe("stripUnwantedFields", () => {
  it("removes forbidden properties from nested response objects", () => {
    const response = {
      roster_id: "1",
      co_owners: ["a"],
      keepers: { qb: "x" },
      metadata: { foo: "bar" },
      player_map: { 1: { player_id: "1" } },
      settings: {
        draft_slot: 1,
        metadata: { nested: true },
      },
      players: [
        {
          player_id: "1",
          birth_city: "Austin",
          high_school: "Lake Travis",
          metadata: { foo: "bar" },
        },
        "2",
      ],
    };

    expect(stripUnwantedFields(response)).toEqual({
      roster_id: "1",
      settings: {
        draft_slot: 1,
      },
      players: [
        {
          player_id: "1",
        },
        "2",
      ],
    });
  });
});
