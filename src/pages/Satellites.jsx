import { useState } from "react";
import SatelliteList from "../components/SatellitesList";
import UpdateSatelliteStatutForm from "../components/UpdateSatelliteStatutForm";
import { useAuth } from "../context/AuthContext";
import { canUpdateSatelliteStatut } from "../utils/permissions";
import "../styles/satelliteStatut.css";

export default function SatellitesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, loading: authLoading } = useAuth();
  const showStatutForm = !authLoading && canUpdateSatelliteStatut(user);

  return (
    <div className="satPage">
      <SatelliteList refreshKey={refreshKey} />
      {showStatutForm ? (
        <UpdateSatelliteStatutForm
          onUpdated={() => setRefreshKey((key) => key + 1)}
        />
      ) : null}
    </div>
  );
}
