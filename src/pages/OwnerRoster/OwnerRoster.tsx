import { Link, useParams } from "react-router-dom";
import { LeagueRoster } from "../../lib/LeagueRoster";

const OwnerRosterPage = (props: { rosters: LeagueRoster[] }) => {
  const { rosters } = props;
  const { ownerId } = useParams();
  const positionOrder = ["QB", "RB", "WR", "TE", "K", "DEF"];

  const selectedRoster = rosters.find((roster) => roster.owner_id === ownerId);
  const wins = selectedRoster?.previousSettings?.wins ?? 0;
  const badgeLabel = wins >= 8 ? "Contender" : "Rebuilding";
  const badgeTone = wins >= 8 ? "status-badge--good" : "status-badge--neutral";

  const positionStrength = positionOrder.reduce<Record<string, number>>(
    (counts, position) => {
      counts[position] =
        selectedRoster?.players.filter((player) => player.position === position)
          .length ?? 0;
      return counts;
    },
    {},
  );

  const strongestPositions = [...positionOrder]
    .sort(
      (left, right) =>
        (positionStrength[right] ?? 0) - (positionStrength[left] ?? 0),
    )
    .slice(0, 2)
    .join(", ");

  const weakestPositions =
    [...positionOrder]
      .sort(
        (left, right) =>
          (positionStrength[left] ?? 0) - (positionStrength[right] ?? 0),
      )
      .filter((position) => (positionStrength[position] ?? 0) <= 1)
      .slice(0, 2)
      .join(", ") || "None flagged";

  return (
    <div className="page-shell">
      <Link className="back-link" to="/">
        Back to league
      </Link>

      <h1 className="page-title">Owner {ownerId} full roster</h1>

      {selectedRoster ? (
        <div className="owner-roster-layout">
          <section className="roster-card roster-card--detail">
            <div className="roster-card-header">
              <div>
                <p className="eyebrow">Roster overview</p>
                <h2>Roster ID: {selectedRoster.roster_id}</h2>
              </div>

              <span className={`status-badge ${badgeTone}`}>{badgeLabel}</span>
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
                    This roster is trending as a {badgeLabel.toLowerCase()} team
                    with strongest depth in {strongestPositions}. The biggest
                    watchouts appear to be {weakestPositions}.
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
                const playersForPosition = selectedRoster.players.filter(
                  (player) => player.position === position,
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
                    key={`${selectedRoster.roster_id}-${position}`}
                    className={positionClassName}
                  >
                    <h2>{position}</h2>
                    {playersForPosition.length > 0 ? (
                      <ul>
                        {playersForPosition.map((player) => (
                          <li key={player.player_id}>
                            {player.first_name} {player.last_name} •{" "}
                            {player.team}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No {position} player selected.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      ) : (
        <p className="empty-state">No roster found for owner {ownerId}.</p>
      )}
    </div>
  );
};

export default OwnerRosterPage;
