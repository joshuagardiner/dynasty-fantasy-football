import { Link } from "react-router-dom";
import { LeagueRoster } from "../../lib/LeagueRoster";

const Roster = (props: { roster: LeagueRoster }) => {
  const { roster } = props;
  const positionOrder = ["QB", "RB", "WR", "TE", "K", "DEF"];

  return (
    <section key={roster.roster_id} style={{ marginBottom: "1.5rem" }}>
      <h2>
        Roster {roster.roster_id} • Owner {roster.owner_id}
      </h2>

      <Link to={`/owner/${roster.owner_id}`}>View full roster</Link>

      <div>
        <strong>Starting lineup:</strong>
        {positionOrder.map((position) => {
          const startersForPosition = roster.starters.filter(
            (starter) => starter.position === position,
          );

          return (
            <div key={`${roster.roster_id}-${position}`}>
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
