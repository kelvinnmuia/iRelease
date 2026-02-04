import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { X, Calendar, BarChart3, Settings, GitBranch, Bug, ChartPie, PanelsTopLeft } from "lucide-react";
import logo from "@/assets/iRelease-mlogo.png";
// import favicon from "../../assets/iRelease-fav.png"
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { NavLink, useNavigate } from "react-router-dom";
const menuItems = [
    { icon: PanelsTopLeft, label: "Dashboard", path: "/dashboard" },
    { icon: GitBranch, label: "Releases", path: "/releases" },
    { icon: Bug, label: "SIRs Per Release", path: "/sirs-per-release" },
    { icon: ChartPie, label: "Monthly Overview", path: "/monthly-overview" },
    { icon: Calendar, label: "Release Calendar", path: "/release-calendar" },
    { icon: BarChart3, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Settings", path: "/settings" },
];
export function Sidebar({ isOpen, onToggle }) {
    const navigate = useNavigate();
    const handleNavigation = (path) => {
        navigate(path);
        // Close sidebar on mobile after navigation
        if (window.innerWidth < 768) {
            onToggle();
        }
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: cn("fixed md:relative md:translate-x-0 top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 overflow-y-auto", "w-64 md:w-64", isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"), children: [_jsxs("div", { className: "h-16 flex items-center justify-between border-b border-gray-200 px-4 sticky top-0 bg-white cursor-pointer", onClick: () => handleNavigation("/dashboard"), children: [_jsx("div", { className: "flex items-center gap-2", children: _jsx("img", { src: logo, alt: "iRelease logo", className: "flex items-center justify-center h-50 w-50" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: "md:hidden", onClick: onToggle, children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("nav", { className: "p-4 space-y-2", children: menuItems.map((item) => {
                            const Icon = item.icon;
                            return (_jsxs(NavLink, { to: item.path, onClick: () => handleNavigation(item.path), className: ({ isActive }) => cn("w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm", isActive ? "bg-gray-200 text-gray-600 font-medium" : "text-gray-700 hover:bg-gray-100"), end: item.path === "/dashboard", children: [_jsx(Icon, { className: "w-5 h-5 flex-shrink-0" }), _jsx("span", { children: item.label })] }, item.label));
                        }) })] }), isOpen && _jsx("div", { className: "fixed inset-0 bg-black/50 md:hidden z-30", onClick: onToggle })] }));
}
