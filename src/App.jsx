import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import LoginPage from "./pages/Login";
import SatellitesPage from "./pages/Satellites";
import CommunicationsPage from "./pages/Communications";
import MissionsPage from "./pages/Missions";
import AlertesPage from "./pages/Alertes";
import HistoriquePage from "./pages/Historique";
import InstrumentsPage from "./pages/Instruments";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import { canManageInstruments } from "./utils/permissions";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<SatellitesPage />} />

              <Route
                path="/communications"
                element={<CommunicationsPage />}
              />

              <Route
                path="/missions"
                element={<MissionsPage />}
              />

              <Route
                path="/alertes"
                element={<AlertesPage />}
              />

              <Route
                path="/historique"
                element={<HistoriquePage />}
              />

              <Route element={<RoleProtectedRoute canAccess={canManageInstruments} />}>
                <Route path="/instruments" element={<InstrumentsPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;