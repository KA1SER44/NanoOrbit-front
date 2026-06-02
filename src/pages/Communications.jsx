import { useState } from "react";
import CommunicationsList from "../components/CommunicationsList";
import PlanCommunicationForm from "../components/PlanCommunicationForm";
import { useAuth } from "../context/AuthContext";
import { canPlanCommunication } from "../utils/permissions";
import "../styles/planCommunication.css";

export default function CommunicationsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, loading: authLoading } = useAuth();
  const showPlanForm = !authLoading && canPlanCommunication(user);

  return (
    <div className="commPage">
      <CommunicationsList refreshKey={refreshKey} />
      {showPlanForm ? (
        <PlanCommunicationForm onPlanned={() => setRefreshKey((k) => k + 1)} />
      ) : null}
    </div>
  );
}