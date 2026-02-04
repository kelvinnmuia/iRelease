import { Release } from '../types/releases';
import { ColumnConfig } from '../types/releases';
export declare const exportToCSV: (data: Release[], visibleColumns: ColumnConfig[], selectedRows: Set<number>) => boolean;
export declare const exportToExcel: (data: Release[], visibleColumns: ColumnConfig[], selectedRows: Set<number>) => boolean;
export declare const exportToJSON: (data: Release[], visibleColumns: ColumnConfig[], selectedRows: Set<number>) => boolean;
export declare const exportSingleRelease: (release: Release) => boolean;
