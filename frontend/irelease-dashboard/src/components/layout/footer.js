import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export function Footer() {
    const currentYear = new Date().getFullYear();
    const platformVersion = "1.0.0";
    return (_jsx("footer", { className: "h-12 bg-white border-t border-gray-200 flex items-center justify-center px-4 md:px-6 py-7", children: _jsxs("div", { className: "text-center text-xs md:text-sm text-gray-600/90", children: ["\u00A9 ", currentYear, " Kenya Revenue Authority \u2022 Powered by BooniSolutions"] }) }));
}
