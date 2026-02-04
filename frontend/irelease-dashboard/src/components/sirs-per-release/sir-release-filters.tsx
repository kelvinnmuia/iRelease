import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import { SearchableDropdown } from "./searchable-dropdown";
import { IterationDropdown } from "./iteration-dropdown";
import { SirsReleaseExportMenu } from "./sirs-release-datatable/sirs-release-export-menu";
import { ColumnsDropdown } from "./columns-dropdown";
import { SearchInput } from "./search-input";
import { SirsReleasesColumnVisibility } from "./sirs-releases-column-visibility";

export interface SirsReleaseFiltersProps {
    // State values
    selectedRelease: string;
    selectedIteration: string;
    globalFilter: string;
    selectedRowsCount?: number;
    isDatatableView?: boolean;

    // State setters
    setSelectedRelease: (release: string) => void;
    setSelectedIteration: (iteration: string) => void;
    setGlobalFilter: (filter: string) => void;

    // Data
    releaseVersions: Array<{ id: string, name: string }>;
    iterations: Array<{ id: string, name: string }>;

    // Callbacks
    onExportCSV: () => void;
    onExportExcel: () => void;
    onExportJSON: () => void;
    onToggleColumns?: () => void;
    onResetColumns?: () => void;
    onMapSirs?: () => void;

    // Add column visibility props (matching the releases pattern)
    columnVisibility?: Record<string, boolean>;
    toggleColumnVisibility?: (columnKey: string) => void;
    resetColumnVisibility?: () => void;
}

export const SirsReleaseFilters = ({
    selectedRelease,
    selectedIteration,
    globalFilter,
    selectedRowsCount = 0,
    isDatatableView = false,
    setSelectedRelease,
    setSelectedIteration,
    setGlobalFilter,
    releaseVersions,
    iterations,
    onExportCSV = () => { },
    onExportExcel = () => { },
    onExportJSON = () => { },
    onToggleColumns = () => { },
    onResetColumns = () => { },
    onMapSirs = () => { },

    // New column visibility props
    columnVisibility = {},
    toggleColumnVisibility = () => { },
    resetColumnVisibility = () => { }
}: SirsReleaseFiltersProps) => {
    // Check if both release and iteration are selected
    const areFiltersSelected = Boolean(selectedRelease && selectedIteration);

    // Determine if datatable features should be enabled
    const shouldEnableDatatableFeatures = isDatatableView && areFiltersSelected;

    return (
        <div className="bg-gray-50 pt-0 p-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                {/* Left Section - Export, Show/Hide, Search */}
                <div className="flex flex-col md:flex-row gap-3 xl:flex-1 xl:max-w-2xl">
                    {/* Export and Show/Hide Columns */}
                    <div className="flex gap-2 flex-1 md:flex-none">
                        <SirsReleaseExportMenu
                            onExportCSV={onExportCSV}
                            onExportExcel={onExportExcel}
                            onExportJSON={onExportJSON}
                            selectedRowsCount={selectedRowsCount}
                            disabled={!shouldEnableDatatableFeatures}
                        />

                        <SirsReleasesColumnVisibility
                            columnVisibility={columnVisibility}
                            toggleColumnVisibility={toggleColumnVisibility}
                            resetColumnVisibility={resetColumnVisibility}
                            areFiltersSelected={shouldEnableDatatableFeatures}
                        />
                    </div>

                    {/* Search Input */}
                    <div className="flex-1 min-w-0">
                        <SearchInput
                            globalFilter={globalFilter}
                            setGlobalFilter={setGlobalFilter}
                            areFiltersSelected={shouldEnableDatatableFeatures}
                        />
                    </div>
                </div>

                {/* Right Section - Release Version, Iteration, and Map SIRs Button */}
                <div className="flex flex-col md:flex-row gap-3 xl:flex-1 xl:justify-end">
                    <div className="flex gap-2 flex-1 md:flex-none">
                        {/* Searchable Release Version Dropdown */}
                        <SearchableDropdown
                            items={releaseVersions}
                            selectedId={selectedRelease}
                            onSelect={setSelectedRelease}
                            placeholder="Release Version"
                            buttonClassName="w-full md:w-[160px] min-w-[160px]"
                            searchPlaceholder="Search ..."
                        />

                        {/* Iteration Dropdown */}
                        <IterationDropdown
                            iterations={iterations}
                            selectedIteration={selectedIteration}
                            onSelect={setSelectedIteration}
                            placeholder="Iteration"
                            buttonClassName="w-full md:w-[120px] min-w-[120px]"
                        />

                        {/* Map SIRs Button */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onMapSirs}
                            className="border-red-400 bg-white text-red-600 hover:bg-red-50 flex-1 md:flex-none md:w-32 gap-2 h-9"
                            disabled={true}
                        >
                            <Map className="w-4 h-4" />
                            <span>Map SIRs</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};