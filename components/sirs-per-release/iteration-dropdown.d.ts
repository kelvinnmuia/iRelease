export interface IterationDropdownProps {
    iterations: Array<{
        id: string;
        name: string;
    }>;
    selectedIteration: string;
    onSelect: (iterationId: string) => void;
    placeholder?: string;
    className?: string;
    buttonClassName?: string;
    searchPlaceholder?: string;
}
export declare const IterationDropdown: ({ iterations, selectedIteration, onSelect, placeholder, className, buttonClassName, searchPlaceholder }: IterationDropdownProps) => import("react/jsx-runtime").JSX.Element;
