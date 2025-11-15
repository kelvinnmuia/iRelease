import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { DashboardLayout } from "@/layout/dashboard-layout"
import DashboardPage from "@/pages/dashboard-page"
import ReleasesPage from "@/pages/releases-page"

export default function App() {
  return (
    <Router>
      <Routes>

        {/* Parent route with layout but NO path */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/releases" element={<ReleasesPage />} />
        </Route>
      </Routes>
    </Router>
  )
}
