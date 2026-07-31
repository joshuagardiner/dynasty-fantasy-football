import { useEffect, useState } from "react";
import { Route, Routes as RoutesDom } from "react-router-dom";
import { LeagueRoster } from "../lib/LeagueRoster";
import { getLeagueRosters } from "../api/Sleeper";
import FantasyFootball from "./FantasyFootball/FantasyFootball";
import OwnerRosterPage from "./OwnerRoster/OwnerRoster";

const Routes = () => {
  const [rosters, setRosters] = useState<LeagueRoster[]>([]);

  useEffect(() => {
    getLeagueRosters()
      .then((data) => {
        setRosters(data);
      })
      .catch((error) => {
        console.error("Error fetching league rosters:", error);
      });
  }, []);

  return (
    <RoutesDom>
      <Route path="/" element={<FantasyFootball rosters={rosters} />} />
      <Route
        path="/owner/:ownerId"
        element={<OwnerRosterPage rosters={rosters} />}
      />
    </RoutesDom>
  );
};

export default Routes;
