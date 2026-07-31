import { Link, useParams } from "react-router-dom";
import { LeagueRoster } from "../../lib/LeagueRoster";

const OwnerRosterPage = (props: { rosters: LeagueRoster[] }) => {
  const { rosters } = props;
  const { ownerId } = useParams();
  const positionOrder = ["QB", "RB", "WR", "TE", "K", "DEF"];

  const selectedRoster = rosters.find((roster) => roster.owner_id === ownerId);

  return (
    <div>
      <Link to="/">Back to league</Link>

      <h1>Owner {ownerId} full roster</h1>

      {selectedRoster ? (
        <div>
          <p>Roster ID: {selectedRoster.roster_id}</p>

          {positionOrder.map((position) => {
            const playersForPosition = selectedRoster.players.filter(
              (player) => player.position === position,
            );

            return (
              <div key={`${selectedRoster.roster_id}-${position}`}>
                <h2>{position}</h2>
                {playersForPosition.length > 0 ? (
                  <ul>
                    {playersForPosition.map((player) => (
                      <li key={player.player_id}>
                        {player.first_name} {player.last_name} • {player.team}
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
      ) : (
        <p>No roster found for owner {ownerId}.</p>
      )}
    </div>
  );
};

export default OwnerRosterPage;
