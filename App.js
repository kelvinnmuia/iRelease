import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/dashboard-layout";
import DashboardPage from "@/pages/dashboard-page";
import ReleasesPage from "@/pages/releases-page";
import SirsPerReleasePage from "@/pages/sirs-per-release-page";
import MonthlyOverviewPage from "@/pages/monthly-overview-page";
import ReleaseCalendarPage from "./pages/release-calendar-page";
import ReportsPage from "@/pages/reports-page";
import SettingsPage from "@/pages/settings-page";
export default function App() {
    return (_jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsxs(Route, { element: _jsx(DashboardLayout, {}), children: [_jsx(Route, { path: "/dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/releases", element: _jsx(ReleasesPage, {}) }), _jsx(Route, { path: "/sirs-per-release", element: _jsx(SirsPerReleasePage, {}) }), _jsx(Route, { path: "/monthly-overview", element: _jsx(MonthlyOverviewPage, {}) }), _jsx(Route, { path: "/release-calendar", element: _jsx(ReleaseCalendarPage, {}) }), _jsx(Route, { path: "/reports", element: _jsx(ReportsPage, {}) }), _jsx(Route, { path: "/settings", element: _jsx(SettingsPage, {}) })] })] }) }));
}
