import { LeagueRoster } from "../../lib/LeagueRoster";
import Roster from "../Roster/Roster";

const RosterCollection = (props: { rosters: LeagueRoster[] }) => {
  const { rosters } = props;

  return (
    <div className="roster-collection-grid">
      {rosters.map((roster) => (
        <Roster key={roster.roster_id} roster={roster} />
      ))}
    </div>
  );
};

export default RosterCollection;
