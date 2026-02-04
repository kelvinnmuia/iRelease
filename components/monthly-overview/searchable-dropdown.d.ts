export interface SearchableDropdownProps {
    items: Array<{
        id: string;
        name: string;
    }>;
    selectedId: string;
    onSelect: (id: string) => void;
    placeholder?: string;
    className?: string;
    buttonClassName?: string;
    searchPlaceholder?: string;
}
export declare const SearchableDropdown: ({ items, selectedId, onSelect, placeholder, className, buttonClassName, searchPlaceholder }: SearchableDropdownProps) => import("react/jsx-runtime").JSX.Element;
