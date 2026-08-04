import { Link } from "react-router-dom";
import { LeagueRoster } from "../../lib/LeagueRoster";

const Roster = (props: { roster: LeagueRoster }) => {
  const { roster } = props;
  const positionOrder = ["QB", "RB", "WR", "TE", "K", "DEF"];
  const wins = roster.previousSettings?.wins ?? 0;
  const badgeLabel = wins >= 8 ? "Contender" : "Rebuilding";
  const badgeTone = wins >= 8 ? "status-badge--good" : "status-badge--neutral";

  const positionStrength = positionOrder.reduce<Record<string, number>>(
    (counts, position) => {
      counts[position] = roster.players.filter(
        (player) => player.position === position,
      ).length;
      return counts;
    },
    {},
  );

  const strongestPositions = [...positionOrder]
    .sort((left, right) => (positionStrength[right] ?? 0) - (positionStrength[left] ?? 0))
    .slice(0, 2)
    .join(", ");

  const weakestPositions = [...positionOrder]
    .sort((left, right) => (positionStrength[left] ?? 0) - (positionStrength[right] ?? 0))
    .filter((position) => (positionStrength[position] ?? 0) <= 1)
    .slice(0, 2)
    .join(", ") || "None flagged";

  return (
    <section key={roster.roster_id} className="roster-card">
      <div className="roster-card-header">
        <div>
          <p className="eyebrow">Roster snapshot</p>
          <h2>
            Roster {roster.roster_id} • Owner {roster.owner_id}
          </h2>
        </div>

        <div className="roster-card-actions">
          <span className={`status-badge ${badgeTone}`}>{badgeLabel}</span>
          <Link className="roster-card-link" to={`/owner/${roster.owner_id}`}>
            View full roster
          </Link>
        </div>
      </div>

      <div className="ai-overview-card">
        <div className="ai-overview-card-header">
          <strong>AI overview</strong>
          <span className="insight-pill">Live analysis</span>
        </div>

        <div className="insight-grid">
          <div className="insight-panel-section">
            <span>Overview</span>
            <p>
              This roster shows a {badgeLabel.toLowerCase()} profile with strong
              positional depth in {strongestPositions} and a few potential
              concerns around {weakestPositions}.
            </p>
          </div>

          <div className="insight-panel-section">
            <span>Strongest positions</span>
            <p>{strongestPositions}</p>
          </div>

          <div className="insight-panel-section">
            <span>Weakest positions</span>
            <p>{weakestPositions}</p>
          </div>
        </div>
      </div>

      <div className="lineup-grid">
        {positionOrder.map((position) => {
          const startersForPosition = roster.starters.filter(
            (starter) => starter.position === position,
          );
          const positionCount = positionStrength[position] ?? 0;
          const positionClassName =
            positionCount >= 3
              ? "position-card position-card--featured"
              : positionCount <= 1
                ? "position-card position-card--watch"
                : "position-card";

          return (
            <div
              key={`${roster.roster_id}-${position}`}
              className={positionClassName}
            >
              <h3>{position}</h3>
              {startersForPosition.length > 0 ? (
                <ul>
                  {startersForPosition.map((starter) => (
                    <li key={starter.player_id}>
                      {starter.first_name} {starter.last_name} • {starter.team}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No {position} starter selected.</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Roster;
