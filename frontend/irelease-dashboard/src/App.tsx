import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import DashboardPage from "@/pages/dashboard-page"
import ReleasesPage from "@/pages/releases-page"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/releases" element={<ReleasesPage />} />
      </Routes>
    </Router>
  )
}
