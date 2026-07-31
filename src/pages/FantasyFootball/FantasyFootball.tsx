import RosterCollection from "../../components/RosterCollection/RosterCollection";
import { LeagueRoster } from "../../lib/LeagueRoster";

const FantasyFootball = (props: { rosters: LeagueRoster[] }) => {
  const { rosters } = props;

  return (
    <div>
      <h1>Fantasy Football</h1>
      <RosterCollection rosters={rosters} />
    </div>
  );
};

export default FantasyFootball;
