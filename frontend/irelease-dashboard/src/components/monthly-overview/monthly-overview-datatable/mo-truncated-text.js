import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
export const TruncatedText = ({ text, maxLength = 30 }) => {
    const shouldTruncate = text.length > maxLength;
    const displayText = shouldTruncate ? `${text.substring(0, maxLength)}...` : text;
    if (!shouldTruncate) {
        return _jsx("span", { className: "text-gray-600", children: displayText });
    }
    return (_jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx("span", { className: "text-gray-600 cursor-default", children: displayText }) }), _jsx(TooltipContent, { side: "top", className: "bg-white text-gray-600 border border-gray-200 shadow-lg max-w-md p-3", children: _jsx("p", { className: "text-sm break-words whitespace-normal overflow-wrap-anywhere", children: text }) })] }) }));
};
