import { LeagueRoster } from "../lib/LeagueRoster";

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || "";
const OPENAI_MODEL = "gpt-4o-mini";
const insightCache = new Map<string, Promise<string>>();

function buildCompactRosterSnapshot(
  roster: LeagueRoster,
): Record<string, unknown> {
  const positionOrder = ["QB", "RB", "WR", "TE", "K", "DEF"];
  const positionCounts = positionOrder.reduce<Record<string, number>>(
    (counts, position) => {
      counts[position] = roster.players.filter(
        (player) => player.position === position,
      ).length;
      return counts;
    },
    {},
  );

  const starters = roster.starters.slice(0, 8).map((starter) => ({
    first_name: starter.first_name,
    last_name: starter.last_name,
    position: starter.position,
    team: starter.team,
  }));

  return {
    roster_id: roster.roster_id,
    owner_id: roster.owner_id,
    previousSettings: roster.previousSettings,
    starters,
    positionCounts,
    benchCount: Math.max(roster.players.length - roster.starters.length, 0),
  };
}

function buildInsightPrompt(roster: LeagueRoster): string {
  const compactSnapshot = buildCompactRosterSnapshot(roster);

  return [
    "You are a fantasy football analyst.",
    "Analyze this compact roster snapshot and return exactly 3 labeled sections:",
    "Overview: <2-3 sentences>",
    "Strongest positions: <position list>",
    "Weakest positions: <position list>",
    "Use previousSettings such as wins, losses, and fpts to contextualize whether the team looks like a contender or a rebuilding roster.",
    "Do not include any extra headings or commentary.",
    "",
    JSON.stringify(compactSnapshot, null, 2),
  ].join("\n");
}

export async function getRosterInsight(roster: LeagueRoster): Promise<string> {
  if (!OPENAI_API_KEY) {
    return "AI insights are disabled because no API key is configured.";
  }

  const cacheKey = `${roster.roster_id}-${roster.owner_id}`;
  const existing = insightCache.get(cacheKey);

  if (existing) {
    console.log(`Returning cached insight for roster ${roster.roster_id}`);
    return existing;
  }

  const request = (async () => {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            temperature: 0.4,
            max_tokens: 120,
            messages: [
              {
                role: "system",
                content:
                  "You are a fantasy football analyst. Return only the roster insight summary in the exact 3-section format requested by the user.",
              },
              {
                role: "user",
                content: buildInsightPrompt(roster),
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`OpenAI request failed with status ${response.status}`);
      }

      const data = (await response.json()) as {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
      };

      const summary = data.choices?.[0]?.message?.content?.trim();
      return summary || "No insight available.";
    } catch {
      return "Error fetching roster insight from OpenAI.";
    }
  })();

  insightCache.set(cacheKey, request);

  return request.finally(() => {
    insightCache.delete(cacheKey);
  });
}
