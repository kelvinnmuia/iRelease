interface SirsReleaseExportMenuProps {
    onExportCSV: () => void;
    onExportExcel: () => void;
    onExportJSON: () => void;
    selectedRowsCount: number;
    disabled?: boolean;
}
export declare const SirsReleaseExportMenu: ({ onExportCSV, onExportExcel, onExportJSON, selectedRowsCount, disabled }: SirsReleaseExportMenuProps) => import("react/jsx-runtime").JSX.Element;
export {};
