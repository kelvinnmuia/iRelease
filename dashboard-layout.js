import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Sidebar } from "./components/layout/sidebar";
import { Header } from "./components/layout/header";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { Footer } from "./components/layout/footer";
export function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (_jsxs("div", { className: "flex h-screen bg-gray-50", children: [_jsx(Sidebar, { isOpen: sidebarOpen, onToggle: () => setSidebarOpen(!sidebarOpen) }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx(Header, { onMenuToggle: () => setSidebarOpen(!sidebarOpen) }), _jsxs("div", { className: "flex-1 overflow-auto flex flex-col", children: [_jsx("div", { className: "flex-1 p-3 sm:p-4 md:p-6", children: _jsx(Outlet, {}) }), _jsx(Footer, {})] })] }), _jsx(Toaster, { position: "top-center", duration: 4000, closeButton: true, richColors: true })] }));
}
