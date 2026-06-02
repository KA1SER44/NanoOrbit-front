import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import LoginPage from "./pages/Login";
import SatellitesPage from "./pages/Satellites";
import CommunicationsPage from "./pages/Communications";
import MissionsPage from "./pages/Missions";
import AlertesPage from "./pages/Alertes";

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
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;