export interface SearchInputProps {
    globalFilter: string;
    setGlobalFilter: (filter: string) => void;
    areFiltersSelected: boolean;
    placeholder?: string;
    className?: string;
}
export declare const SearchInput: ({ globalFilter, setGlobalFilter, areFiltersSelected, placeholder, className }: SearchInputProps) => import("react/jsx-runtime").JSX.Element;
