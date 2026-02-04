import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
export const ReleasesPagination = ({ currentPage, totalPages, itemsPerPage, totalItems, startIndex, onPageChange, visibleColumnsCount, }) => {
    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        const ellipsis = "...";
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        }
        else {
            pages.push(1);
            if (currentPage <= 3) {
                for (let i = 2; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push(ellipsis);
                pages.push(totalPages);
            }
            else if (currentPage >= totalPages - 2) {
                pages.push(ellipsis);
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            }
            else {
                pages.push(ellipsis);
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push(ellipsis);
                pages.push(totalPages);
            }
        }
        return pages.map((page, index) => {
            if (page === ellipsis) {
                return (_jsx("span", { className: "min-w-9 h-9 flex items-center justify-center text-gray-500 px-2", children: ellipsis }, `ellipsis-${index}`));
            }
            return (_jsx(Button, { size: "sm", variant: currentPage === page ? "default" : "outline", onClick: () => onPageChange(page), className: `min-w-9 h-9 p-0 ${currentPage === page
                    ? "bg-red-500 text-white hover:bg-red-600 border-red-500"
                    : "border-gray-300 hover:bg-gray-50"}`, children: page }, page));
        });
    };
    return (_jsxs("div", { className: "border-t border-gray-200 px-6 py-4 bg-white flex flex-col sm:flex-row justify-between items-center gap-4", children: [_jsxs("div", { className: "text-sm text-gray-600 text-center sm:text-left", children: ["Viewing ", startIndex + 1, "-", Math.min(startIndex + itemsPerPage, totalItems), " of ", totalItems, _jsxs("span", { className: "ml-2", children: ["\u2022 ", visibleColumnsCount, " columns visible"] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => onPageChange(Math.max(1, currentPage - 1)), disabled: currentPage === 1, className: "border-gray-300 hover:bg-gray-50 min-w-9 h-9 p-0", children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), renderPageNumbers(), _jsx(Button, { variant: "outline", size: "sm", onClick: () => onPageChange(Math.min(totalPages, currentPage + 1)), disabled: currentPage === totalPages, className: "border-gray-300 hover:bg-gray-50 min-w-9 h-9 p-0", children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] })] }));
};
