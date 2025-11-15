import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { DashboardLayout } from "@/layout/dashboard-layout"
import DashboardPage from "@/pages/dashboard-page"
import ReleasesPage from "@/pages/releases-page"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Wrap all dashboard-related pages */}
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/releases" element={<ReleasesPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}
