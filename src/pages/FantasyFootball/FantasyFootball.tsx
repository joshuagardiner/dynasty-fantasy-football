import RosterCollection from "../../components/RosterCollection/RosterCollection";
import { LeagueRoster } from "../../lib/LeagueRoster";

const FantasyFootball = (props: { rosters: LeagueRoster[] }) => {
  const { rosters } = props;

  console.log("FantasyFootball rosters:", rosters);
  return (
    <div className="page-shell">
      <h1 className="page-title">Fantasy Football</h1>
      <RosterCollection rosters={rosters} />
    </div>
  );
};

export default FantasyFootball;
