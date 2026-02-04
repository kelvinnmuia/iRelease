import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Menu } from "lucide-react";
// import { Input } from "../ui/input"
import { Button } from "../ui/button";
export function Header({ onMenuToggle }) {
    return (_jsx("header", { className: "h-16 bg-red-600 border-b border-gray-200 flex items-center justify-center px-4 md:px-6 gap-4", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx(Button, { variant: "ghost", size: "icon", className: "absolute left-4 md:hidden", onClick: onMenuToggle, children: _jsx(Menu, { className: "w-5 h-5" }) }), _jsx("h1", { className: "text-xl md:text-2xl font-bold text-white", children: "Dashboard" })] }) }));
}
