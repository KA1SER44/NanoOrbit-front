import { useState } from "react";
import AssignParticipationForm from "../components/AssignParticipationForm";
import MissionsList from "../components/MissionsList";
import { useAuth } from "../context/AuthContext";
import { canAssignParticipation } from "../utils/permissions";
import "../styles/planCommunication.css";

export default function MissionsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, loading: authLoading } = useAuth();
  const showAssignForm = !authLoading && canAssignParticipation(user);

  return (
    <div className="missionsPage">
      <MissionsList refreshKey={refreshKey} />
      {showAssignForm ? (
        <AssignParticipationForm
          onAssigned={() => setRefreshKey((key) => key + 1)}
        />
      ) : null}
    </div>
  );
}
