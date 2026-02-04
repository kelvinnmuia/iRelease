interface ExportMenuProps {
    onExportCSV: () => void;
    onExportExcel: () => void;
    onExportJSON: () => void;
    selectedRowsCount: number;
}
export declare const ExportMenu: ({ onExportCSV, onExportExcel, onExportJSON, selectedRowsCount }: ExportMenuProps) => import("react/jsx-runtime").JSX.Element;
export {};
