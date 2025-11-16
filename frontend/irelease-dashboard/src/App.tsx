import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { DashboardLayout } from "@/dashboard-layout"
import DashboardPage from "@/pages/dashboard-page"
import ReleasesPage from "@/pages/releases-page"
import SirsPerReleasePage from "@/pages/sirs-per-release"

export default function App() {
  return (
    <Router>
      <Routes>

        {/* Redirect root "/" to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Layout wrapper */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/releases" element={<ReleasesPage />} />
          <Route path="/sirs-per-release" element={<SirsPerReleasePage />} />
        </Route>

      </Routes>
    </Router>
  )
}

