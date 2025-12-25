import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface IterationDropdownProps {
    iterations: Array<{ id: string, name: string }>;
    selectedIteration: string;
    onSelect: (iterationId: string) => void;
    placeholder?: string;
    className?: string;
    buttonClassName?: string;
}

export const IterationDropdown = ({
    iterations,
    selectedIteration,
    onSelect,
    placeholder = "Iteration",
    className = "",
    buttonClassName = "",
}: IterationDropdownProps) => {
    const selectedItem = iterations.find(i => i.id === selectedIteration);

    return (
        <div className={`relative ${className}`}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="sm"
                        variant="outline"
                        className={`flex items-center justify-between bg-white border-gray-300 hover:bg-gray-50 w-full min-w-[120px] h-9 ${buttonClassName}`}
                    >
                        <span className="truncate flex-1 text-left">
                            {selectedItem?.name || placeholder}
                        </span>
                        <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[120px]" align="start">
                    {iterations.map((iteration) => (
                        <DropdownMenuItem
                            key={iteration.id}
                            onClick={() => onSelect(iteration.id)}
                            className={selectedIteration === iteration.id ? "bg-gray-100 font-medium" : ""}
                        >
                            {iteration.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};