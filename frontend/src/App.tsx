import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import { SimulationPage } from "./pages/SimulationPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ComparisonPage } from "./pages/ComparisonPage";
import { SensitivityPage } from "./pages/SensitivityPage";
import { MonteCarloPage } from "./pages/MonteCarloPage";
import { DispatchPage } from "./pages/DispatchPage";

import "./App.css";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/simulation" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/comparison" element={<ComparisonPage />} />
        <Route path="/sensitivity" element={<SensitivityPage />} />
        <Route path="/monte-carlo" element={<MonteCarloPage />} />
        <Route path="/dispatch" element={<DispatchPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;