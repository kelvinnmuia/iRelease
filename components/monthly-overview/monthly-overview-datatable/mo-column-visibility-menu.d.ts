interface ColumnVisibilityMenuProps {
    columnVisibility: Record<string, boolean>;
    toggleColumnVisibility: (columnKey: string) => void;
    resetColumnVisibility: () => void;
}
export declare const ColumnVisibilityMenu: ({ columnVisibility, toggleColumnVisibility, resetColumnVisibility }: ColumnVisibilityMenuProps) => import("react/jsx-runtime").JSX.Element;
export {};
