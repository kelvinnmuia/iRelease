import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { SirReleaseData } from './../types/sirs-releases-types';
import { ColumnConfig } from './../types/sirs-releases-types';
import { formatISODate } from './sirs-release-date-utils';

// Helper function to format date fields for export (USED BY BOTH SINGLE AND MULTIPLE EXPORTS)
const formatDateForExport = (dateValue: any): string => {
  if (!dateValue) return '';
  
  const dateString = String(dateValue);
  if (!dateString || dateString.trim() === '') return '';
  
  // Check if it's already in the desired format (e.g., "13 Nov 2024")
  const dateFormatRegex = /^\d{1,2}\s[A-Za-z]{3}\s\d{4}$/;
  if (dateFormatRegex.test(dateString)) {
    return dateString;
  }
  
  // Otherwise, try to format it using formatISODate
  try {
    return formatISODate(dateString);
  } catch (error) {
    console.warn('Could not format date:', dateString, error);
    return dateString;
  }
};

// Helper function to transform SirRelease data for export with proper date formatting
const transformSirReleaseForExport = (sir_release_data: SirReleaseData, visibleColumns: ColumnConfig[]) => {
  const exportData: Record<string, any> = {};
  
  visibleColumns.forEach(col => {
    const value = sir_release_data[col.key];
    
    // Check if this is a date field that needs formatting
    // For SIRs releases, the main date field is 'changed_date'
    const dateFields = ['changed_date'];
    
    if (dateFields.includes(col.key) && value) {
      exportData[col.label] = formatDateForExport(value);
    } else {
      // Handle potential undefined values
      exportData[col.label] = value !== undefined ? value : '';
    }
  });
  
  return exportData;
};

export const exportToCSV = (data: SirReleaseData[], visibleColumns: ColumnConfig[], selectedRows: Set<number>) => {
  try {
    const dataToExport = selectedRows.size > 0
      ? data.filter(item => selectedRows.has(item.id))
      : data;

    if (dataToExport.length === 0) {
      console.warn('No data to export');
      return false;
    }

    const filteredDataForExport = dataToExport.map(sir_release_data => 
      transformSirReleaseForExport(sir_release_data, visibleColumns)
    );

    const csv = Papa.unparse(filteredDataForExport, { 
      header: true,
      delimiter: ',',
      quotes: true,
      escapeFormulae: true
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
    const dataToExport = selectedRows.size > 0
      ? data.filter(item => selectedRows.has(item.id))
      : data;

    if (dataToExport.length === 0) {
      console.warn('No data to export');
      return false;
    }

    const filteredDataForExport = dataToExport.map(sir_release_data => 
      transformSirReleaseForExport(sir_release_data, visibleColumns)
    );

    const worksheet = XLSX.utils.json_to_sheet(filteredDataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SIR Releases');

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
    const dataToExport = selectedRows.size > 0
      ? data.filter(item => selectedRows.has(item.id))
      : data;

    if (dataToExport.length === 0) {
      console.warn('No data to export');
      return false;
    }

    const filteredDataForExport = dataToExport.map(sir_release_data => 
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
    // Use the SAME date formatting function as bulk exports for consistency
    const exportData = {
      'Sir_Rel_Id': sir_release_data.sir_release_id,
      'Sir_Id': sir_release_data.sir_id,
      'Release Version': sir_release_data.release_version,
      'Iteration': sir_release_data.iteration,
      'Changed Date': formatDateForExport(sir_release_data.changed_date), // USING SAME FUNCTION
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SIR Release Details');

    const cols = [
      { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 15 },
      { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
      { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 15 }
    ];
    worksheet['!cols'] = cols;
    
    XLSX.writeFile(workbook, `SIR-release-${sir_release_data.sir_release_id}-${new Date().toISOString().split('T')[0]}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting single SIR release:', error);
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
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};