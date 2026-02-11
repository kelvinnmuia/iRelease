import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import { SearchableDropdown } from "./searchable-dropdown";
import { SearchInput } from "./search-input";
import { SirsReleasesColumnVisibility } from "./sirs-releases-column-visibility";
import { SirsReleaseExportMenu } from "../sirs-per-release/sirs-release-datatable/sirs-release-export-menu";
import { IterationDropdown } from "../sirs-per-release/iteration-dropdown";
export const SirsReleaseFilters = ({ selectedRelease, selectedIteration, globalFilter, selectedRowsCount = 0, isDatatableView = false, setSelectedRelease, setSelectedIteration, setGlobalFilter, releaseVersions, iterations, onExportCSV = () => { }, onExportExcel = () => { }, onExportJSON = () => { }, onToggleColumns = () => { }, onResetColumns = () => { }, onMapSirs = () => { }, 
// New column visibility props
columnVisibility = {}, toggleColumnVisibility = () => { }, resetColumnVisibility = () => { } }) => {
    // Check if both release and iteration are selected
    const areFiltersSelected = Boolean(selectedRelease && selectedIteration);
    // Determine if datatable features should be enabled
    const shouldEnableDatatableFeatures = isDatatableView && areFiltersSelected;
    return (_jsx("div", { className: "bg-gray-50 pt-0 p-6", children: _jsxs("div", { className: "flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-3 xl:flex-1 xl:max-w-2xl", children: [_jsxs("div", { className: "flex gap-2 flex-1 md:flex-none", children: [_jsx(SirsReleaseExportMenu, { onExportCSV: onExportCSV, onExportExcel: onExportExcel, onExportJSON: onExportJSON, selectedRowsCount: selectedRowsCount, disabled: !shouldEnableDatatableFeatures }), _jsx(SirsReleasesColumnVisibility, { columnVisibility: columnVisibility, toggleColumnVisibility: toggleColumnVisibility, resetColumnVisibility: resetColumnVisibility, areFiltersSelected: shouldEnableDatatableFeatures })] }), _jsx("div", { className: "flex-1 min-w-0", children: _jsx(SearchInput, { globalFilter: globalFilter, setGlobalFilter: setGlobalFilter, areFiltersSelected: shouldEnableDatatableFeatures }) })] }), _jsx("div", { className: "flex flex-col md:flex-row gap-3 xl:flex-1 xl:justify-end", children: _jsxs("div", { className: "flex gap-2 flex-1 md:flex-none", children: [_jsx(SearchableDropdown, { items: releaseVersions, selectedId: selectedRelease, onSelect: setSelectedRelease, placeholder: "Release Version", buttonClassName: "w-full md:w-[160px] min-w-[160px]", searchPlaceholder: "Search ..." }), _jsx(IterationDropdown, { iterations: iterations, selectedIteration: selectedIteration, onSelect: setSelectedIteration, placeholder: "Iteration", buttonClassName: "w-full md:w-[120px] min-w-[120px]" }), _jsxs(Button, { size: "sm", variant: "outline", onClick: onMapSirs, className: "border-red-400 bg-white text-red-600 hover:bg-red-50 flex-1 md:flex-none md:w-32 gap-2 h-9", children: [_jsx(Map, { className: "w-4 h-4" }), _jsx("span", { children: "Map SIRs" })] })] }) })] }) }));
};
