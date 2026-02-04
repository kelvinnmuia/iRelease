import { SirReleaseData } from './../types/sirs-releases-types';
import { ColumnConfig } from './../types/sirs-releases-types';
export declare const exportToCSV: (data: SirReleaseData[], visibleColumns: ColumnConfig[], selectedRows: Set<number>) => boolean;
export declare const exportToExcel: (data: SirReleaseData[], visibleColumns: ColumnConfig[], selectedRows: Set<number>) => boolean;
export declare const exportToJSON: (data: SirReleaseData[], visibleColumns: ColumnConfig[], selectedRows: Set<number>) => boolean;
export declare const exportSingleSirRelease: (sir_release_data: SirReleaseData) => boolean;
