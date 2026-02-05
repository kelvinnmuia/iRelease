import { BrowserRouter as Router, Routes, Route, Navigate, BrowserRouter } from "react-router-dom"
import { DashboardLayout } from "@/dashboard-layout"
import DashboardPage from "@/pages/dashboard-page"
import ReleasesPage from "@/pages/releases-page"
import SirsPerReleasePage from "@/pages/sirs-per-release-page"
import MonthlyOverviewPage from "@/pages/monthly-overview-page"
import ReleaseCalendarPage from "./pages/release-calendar-page"
import ReportsPage from "@/pages/reports-page"
import SettingsPage from "@/pages/settings-page"
export default function App() {
  return (

    <BrowserRouter basename="/iRelease">
      <Routes>

        {/* Redirect root "/" to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Layout wrapper */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/releases" element={<ReleasesPage />} />
          <Route path="/sirs-per-release" element={<SirsPerReleasePage />} />
          <Route path="/monthly-overview" element={<MonthlyOverviewPage />} />
          <Route path="/release-calendar" element={<ReleaseCalendarPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

      </Routes>
     </BrowserRouter>
  )
}

