import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    return (
        <div className="bg-gray-50 pt-0 p-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                {/* Left Section - Export, Show/Hide, Search */}
                <div className="flex flex-col md:flex-row gap-3 xl:flex-1 xl:max-w-2xl">
                    {/* Export and Show/Hide */}
                    <div className="flex gap-2 flex-1 md:flex-none">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2 border-red-400 text-red-600 bg-white hover:bg-red-50 flex-1 md:flex-none md:w-auto min-w-[100px]">
                                    <Download className="w-4 h-4" />
                                    <span>Export</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-[130px]">
                                <DropdownMenuItem onClick={onExportCSV}>
                                    Export to CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onExportExcel}>
                                    Export to Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onExportJSON}>
                                    Export to JSON
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex-1 md:flex-none md:w-auto min-w-[140px]">
                                    <Columns3 className="w-4 h-4" />
                                    <span>Columns</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-[150px]">
                                <DropdownMenuItem onClick={onToggleColumns}>
                                    Toggle Columns
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onResetColumns}>
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
                                    setGlobalFilter(e.target.value);
                                }}
                                className="w-full pl-9 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 focus:ring-2 focus:ring-offset-0 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Section - Release Version, Iteration, and Map SIRs Button */}
                <div className="flex flex-col md:flex-row gap-3 xl:flex-1 xl:justify-end">
                    <div className="flex gap-2 flex-1 md:flex-none">
                        {/* Release Version Select */}
                        <Select onValueChange={setSelectedRelease} value={selectedRelease}>
                            <SelectTrigger className="w-full md:w-[180px] h-9 bg-white border-gray-300">
                                <SelectValue placeholder="Release Version" />
                            </SelectTrigger>
                            <SelectContent>
                                {releaseVersions.map((release) => (
                                    <SelectItem key={release.id} value={release.id}>
                                        {release.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Iteration Select */}
                        <Select onValueChange={setSelectedIteration} value={selectedIteration}>
                            <SelectTrigger className="w-full md:w-[160px] h-9 bg-white border-gray-300">
                                <SelectValue placeholder="Iteration" />
                            </SelectTrigger>
                            <SelectContent>
                                {iterations.map((iteration) => (
                                    <SelectItem key={iteration.id} value={iteration.id}>
                                        {iteration.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Map SIRs Button */}
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