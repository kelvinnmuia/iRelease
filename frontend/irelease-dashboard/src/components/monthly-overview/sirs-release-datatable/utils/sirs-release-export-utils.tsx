import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { SirReleaseData } from './../types/sirs-releases-types';
import { ColumnConfig } from './../types/sirs-releases-types';

// Helper function to transform SirRelease data for export
const transformSirReleaseForExport = (sir_release_data: SirReleaseData, visibleColumns: ColumnConfig[]) => {
  const exportData: Record<string, any> = {};
  
  visibleColumns.forEach(col => {
    // Handle potential undefined values
    const value = sir_release_data[col.key];
    exportData[col.label] = value !== undefined ? value : '';
  });
  
  return exportData;
};

export const exportToCSV = (data: SirReleaseData[], visibleColumns: ColumnConfig[], selectedRows: Set<number>) => {
  try {
    // Note: The data parameter should already be filtered to only include selected rows
    // when the user has made a selection. The parent component handles this filtering.
    
    if (data.length === 0) {
      console.warn('No data to export');
      return false;
    }

    const filteredDataForExport = data.map(sir_release_data => 
      transformSirReleaseForExport(sir_release_data, visibleColumns)
    );

    const csv = Papa.unparse(filteredDataForExport, { 
      header: true,
      delimiter: ',',
      quotes: true,
      escapeFormulae: true // Prevent CSV injection
    });
    
    const filename = `SIRs-releases-export-${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
};

export const exportToExcel = (data: SirReleaseData[], visibleColumns: ColumnConfig[], selectedRows: Set<number>) => {
  try {
    // Note: The data parameter should already be filtered to only include selected rows
    // when the user has made a selection. The parent component handles this filtering.
    
    if (data.length === 0) {
      console.warn('No data to export');
      return false;
    }

    const filteredDataForExport = data.map(sir_release_data => 
      transformSirReleaseForExport(sir_release_data, visibleColumns)
    );

    const worksheet = XLSX.utils.json_to_sheet(filteredDataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SIR Releases');

    // Set column widths based on column labels and content
    const maxContentLengths: number[] = [];
    filteredDataForExport.forEach(row => {
      Object.values(row).forEach((value, index) => {
        const length = String(value).length;
        if (!maxContentLengths[index] || length > maxContentLengths[index]) {
          maxContentLengths[index] = length;
        }
      });
    });

    const cols = visibleColumns.map((col, index) => ({ 
      wch: Math.max(col.label.length, maxContentLengths[index] || 10, 15) 
    }));
    worksheet['!cols'] = cols;

    const filename = `SIRs-releases-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

export const exportToJSON = (data: SirReleaseData[], visibleColumns: ColumnConfig[], selectedRows: Set<number>) => {
  try {
    // Note: The data parameter should already be filtered to only include selected rows
    // when the user has made a selection. The parent component handles this filtering.
    
    if (data.length === 0) {
      console.warn('No data to export');
      return false;
    }

    const filteredDataForExport = data.map(sir_release_data => 
      transformSirReleaseForExport(sir_release_data, visibleColumns)
    );

    const json = JSON.stringify(filteredDataForExport, null, 2);
    const filename = `SIRs-releases-export-${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(json, filename, 'application/json');
    return true;
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    return false;
  }
};

export const exportSingleSirRelease = (sir_release_data: SirReleaseData) => {
  try {
    const exportData = {
      'Sir_Rel_Id': sir_release_data.sir_release_id,
      'Sir_Id': sir_release_data.sir_id,
      'Release Version': sir_release_data.release_version,
      'Iteration': sir_release_data.iteration,
      'Changed Date': sir_release_data.changed_date,
      'Bug Severity': sir_release_data.bug_severity,
      'Priority': sir_release_data.priority,
      'Assigned To': sir_release_data.assigned_to,
      'Bug Status': sir_release_data.bug_status,
      'Resolution': sir_release_data.resolution,
      'Component': sir_release_data.component,
      'Op Sys': sir_release_data.op_sys,
      'Short Description': sir_release_data.short_desc,
      'Cf Sir With': sir_release_data.cf_sirwith
    };

    const worksheet = XLSX.utils.json_to_sheet([exportData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Release Details');

    const cols = [
      { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
      { wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
      { wch: 18 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
    ];
    worksheet['!cols'] = cols;
    
    XLSX.writeFile(workbook, `SIR-release-${sir_release_data.sir_release_id}-${new Date().toISOString().split('T')[0]}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting single release:', error);
    return false;
  }
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};