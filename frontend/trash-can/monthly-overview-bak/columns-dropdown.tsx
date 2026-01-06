import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Columns3 } from "lucide-react";

export interface ShowHideColumnsDropdownProps {
    areFiltersSelected: boolean;
    onToggleColumns: () => void;
    onResetColumns: () => void;
    buttonClassName?: string;
}

export const ColumnsDropdown = ({
    areFiltersSelected,
    onToggleColumns,
    onResetColumns,
    buttonClassName = ""
}: ShowHideColumnsDropdownProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={`gap-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex-1 md:flex-none md:w-auto min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
                    disabled={!areFiltersSelected}
                >
                    <>
                        <Columns3 className="w-4 h-4" />
                        <span>Columns</span>
                    </>
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
    );
};