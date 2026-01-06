import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Columns3, Search, ChevronDown, Map } from "lucide-react";

export interface SirsReleaseFiltersProps {
    // State values
    selectedRelease: string;
    selectedIteration: string;
    globalFilter: string;

    // State setters
    setSelectedRelease: (release: string) => void;
    setSelectedIteration: (iteration: string) => void;
    setGlobalFilter: (filter: string) => void;

    // Data
    releaseVersions: Array<{ id: string, name: string }>;
    iterations: Array<{ id: string, name: string }>;

    // Callbacks (placeholders for now)
    onExportCSV?: () => void;
    onExportExcel?: () => void;
    onExportJSON?: () => void;
    onToggleColumns?: () => void;
    onResetColumns?: () => void;
    onMapSirs?: () => void; // New callback for Map SIRs
}

export const SirsReleaseFilters = ({
    selectedRelease,
    selectedIteration,
    globalFilter,
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
    onMapSirs = () => { } // New prop with default function
}: SirsReleaseFiltersProps) => {
    // Check if both release and iteration are selected
    const areFiltersSelected = selectedRelease && selectedIteration;
    
    return (
        <div className="bg-gray-50 pt-0 p-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                {/* Left Section - Export, Show/Hide, Search */}
                <div className="flex flex-col md:flex-row gap-3 xl:flex-1 xl:max-w-2xl">
                    {/* Export and Show/Hide */}
                    <div className="flex gap-2 flex-1 md:flex-none">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-2 border-red-400 text-red-600 bg-white hover:bg-red-50 flex-1 md:flex-none md:w-auto min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!areFiltersSelected}
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Export</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-[130px]">
                                <DropdownMenuItem 
                                    onClick={areFiltersSelected ? onExportCSV : undefined}
                                    className={!areFiltersSelected ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    Export to CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={areFiltersSelected ? onExportExcel : undefined}
                                    className={!areFiltersSelected ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    Export to Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={areFiltersSelected ? onExportJSON : undefined}
                                    className={!areFiltersSelected ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    Export to JSON
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex-1 md:flex-none md:w-auto min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!areFiltersSelected}
                                >
                                    <Columns3 className="w-4 h-4" />
                                    <span>Columns</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-[150px]">
                                <DropdownMenuItem 
                                    onClick={areFiltersSelected ? onToggleColumns : undefined}
                                    className={!areFiltersSelected ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    Toggle Columns
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={areFiltersSelected ? onResetColumns : undefined}
                                    className={!areFiltersSelected ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    Reset Columns
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Search Input */}
                    <div className="flex-1 min-w-0">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                            <Input
                                placeholder="Search SIRs..."
                                value={globalFilter}
                                onChange={(e) => {
                                    if (areFiltersSelected) {
                                        setGlobalFilter(e.target.value);
                                    }
                                }}
                                disabled={!areFiltersSelected}
                                className={`w-full pl-9 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 focus:ring-2 focus:ring-offset-0 focus:outline-none ${
                                    !areFiltersSelected ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Section - Release Version, Iteration, and Map SIRs Button */}
                <div className="flex flex-col md:flex-row gap-3 xl:flex-1 xl:justify-end">
                    <div className="flex gap-2 flex-1 md:flex-none">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center justify-between bg-white border-gray-300 hover:bg-gray-50 w-full md:w-[160px] min-w-[160px]"
                                >
                                    <span className="truncate flex-1 text-left">
                                        {selectedRelease
                                            ? releaseVersions.find(r => r.id === selectedRelease)?.name || "Release Version"
                                            : "Release Version"
                                        }
                                    </span>
                                    <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-[160px]">
                                {releaseVersions.map((release) => (
                                    <DropdownMenuItem
                                        key={release.id}
                                        onClick={() => setSelectedRelease(release.id)}
                                        className={selectedRelease === release.id ? "bg-gray-100" : ""}
                                    >
                                        {release.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Iteration Select */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center justify-between bg-white border-gray-300 hover:bg-gray-50 w-full md:w-[120px] min-w-[120px]"
                                >
                                    <span className="truncate flex-1 text-left">
                                        {selectedIteration
                                            ? iterations.find(i => i.id === selectedIteration)?.name || "Iteration"
                                            : "Iteration"
                                        }
                                    </span>
                                    <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-[120px]">
                                {iterations.map((iteration) => (
                                    <DropdownMenuItem
                                        key={iteration.id}
                                        onClick={() => setSelectedIteration(iteration.id)}
                                        className={selectedIteration === iteration.id ? "bg-gray-100" : ""}
                                    >
                                        {iteration.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Map SIRs Button - NOT disabled */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onMapSirs}
                            className="border-red-400 bg-white text-red-600 hover:bg-red-50 flex-1 md:flex-none md:w-32 gap-2"
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