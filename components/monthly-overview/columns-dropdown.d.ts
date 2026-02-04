export interface ShowHideColumnsDropdownProps {
    areFiltersSelected: boolean;
    onToggleColumns: () => void;
    onResetColumns: () => void;
    buttonClassName?: string;
}
export declare const ColumnsDropdown: ({ areFiltersSelected, onToggleColumns, onResetColumns, buttonClassName }: ShowHideColumnsDropdownProps) => import("react/jsx-runtime").JSX.Element;
