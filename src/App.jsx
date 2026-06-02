import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import SatellitesPage from "./pages/Satellites";
import CommunicationsPage from "./pages/Communications";
import MissionsPage from "./pages/Missions";
import AlertesPage from "./pages/Alertes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;