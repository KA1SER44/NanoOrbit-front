import { useState } from "react";
import SatelliteList from "../components/SatellitesList";
import DesorbiterSatelliteForm from "../components/DesorbiterSatelliteForm";
import UpdateSatelliteStatutForm from "../components/UpdateSatelliteStatutForm";
import { useAuth } from "../context/AuthContext";
import {
  canDesorbiterSatellite,
  canUpdateSatelliteStatut,
} from "../utils/permissions";
import "../styles/satelliteStatut.css";

export default function SatellitesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, loading: authLoading } = useAuth();
  const showStatutForm = !authLoading && canUpdateSatelliteStatut(user);
  const showDesorbiterForm = !authLoading && canDesorbiterSatellite(user);

  const handleRefresh = () => setRefreshKey((key) => key + 1);

  return (
    <div className="satPage">
      <SatelliteList refreshKey={refreshKey} />
      {showStatutForm ? (
        <UpdateSatelliteStatutForm onUpdated={handleRefresh} />
      ) : null}
      {showDesorbiterForm ? (
        <DesorbiterSatelliteForm onDesorbited={handleRefresh} />
      ) : null}
    </div>
  );
}
