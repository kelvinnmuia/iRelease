import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { formatISODate } from './date-utils'; // Import the date formatting function
// Helper function to format date fields for export
const formatDateForExport = (dateValue) => {
    if (!dateValue)
        return '';
    const dateString = String(dateValue);
    if (!dateString || dateString.trim() === '')
        return '';
    // Check if it's already in the desired format (e.g., "13 Nov 2024")
    const dateFormatRegex = /^\d{1,2}\s[A-Za-z]{3}\s\d{4}$/;
    if (dateFormatRegex.test(dateString)) {
        return dateString;
    }
    // Otherwise, try to format it using formatISODate
    try {
        return formatISODate(dateString);
    }
    catch (error) {
        console.warn('Could not format date:', dateString, error);
        return dateString;
    }
};
// Helper function to transform Release data for export with proper date formatting
const transformReleaseForExport = (release, visibleColumns) => {
    const exportData = {};
    visibleColumns.forEach(col => {
        const value = release[col.key];
        // Check if this is a date field that needs formatting
        const dateFields = [
            'deliveredDate', 'tdNoticeDate', 'testDeployDate',
            'testStartDate', 'testEndDate', 'prodDeployDate'
        ];
        if (dateFields.includes(col.key) && value) {
            exportData[col.label] = formatDateForExport(value);
        }
        else {
            exportData[col.label] = value;
        }
    });
    return exportData;
};
export const exportToCSV = (data, visibleColumns, selectedRows) => {
    try {
        const dataToExport = selectedRows.size > 0
            ? data.filter(item => selectedRows.has(item.id))
            : data;
        const filteredDataForExport = dataToExport.map(release => transformReleaseForExport(release, visibleColumns));
        const csv = Papa.unparse(filteredDataForExport, { header: true });
        downloadFile(csv, `releases-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
        return true;
    }
    catch (error) {
        console.error('Error exporting to CSV:', error);
        return false;
    }
};
export const exportToExcel = (data, visibleColumns, selectedRows) => {
    try {
        const dataToExport = selectedRows.size > 0
            ? data.filter(item => selectedRows.has(item.id))
            : data;
        const filteredDataForExport = dataToExport.map(release => transformReleaseForExport(release, visibleColumns));
        const worksheet = XLSX.utils.json_to_sheet(filteredDataForExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Releases');
        const cols = visibleColumns.map((col) => ({ wch: Math.max(col.label.length, 15) }));
        worksheet['!cols'] = cols;
        XLSX.writeFile(workbook, `releases-export-${new Date().toISOString().split('T')[0]}.xlsx`);
        return true;
    }
    catch (error) {
        console.error('Error exporting to Excel:', error);
        return false;
    }
};
export const exportToJSON = (data, visibleColumns, selectedRows) => {
    try {
        const dataToExport = selectedRows.size > 0
            ? data.filter(item => selectedRows.has(item.id))
            : data;
        const filteredDataForExport = dataToExport.map(release => transformReleaseForExport(release, visibleColumns));
        const json = JSON.stringify(filteredDataForExport, null, 2);
        downloadFile(json, `releases-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        return true;
    }
    catch (error) {
        console.error('Error exporting to JSON:', error);
        return false;
    }
};
export const exportSingleRelease = (release) => {
    try {
        // Format date fields for single release export
        const formatSingleDate = (dateValue) => {
            if (!dateValue)
                return '';
            try {
                return formatISODate(String(dateValue));
            }
            catch (error) {
                return String(dateValue);
            }
        };
        const exportData = {
            'Release ID': release.releaseId,
            'System Name': release.systemName,
            'System ID': release.systemId,
            'Release Version': release.releaseVersion,
            'Iteration': release.iteration,
            'Release Description': release.releaseDescription,
            'Functionality Delivered': release.functionalityDelivered,
            'Date Delivered': formatSingleDate(release.deliveredDate),
            'TD Notice Date': formatSingleDate(release.tdNoticeDate),
            'Test Deploy Date': formatSingleDate(release.testDeployDate),
            'Test Start Date': formatSingleDate(release.testStartDate),
            'Test End Date': formatSingleDate(release.testEndDate),
            'Prod Deploy Date': formatSingleDate(release.prodDeployDate),
            'Test Status': release.testStatus,
            'Deployment Status': release.deploymentStatus,
            'Outstanding Issues': release.outstandingIssues,
            'Comments': release.comments,
            'Release Type': release.releaseType,
            'Month': release.month,
            'Financial Year': release.financialYear,
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
        XLSX.writeFile(workbook, `release-${release.releaseId}-${new Date().toISOString().split('T')[0]}.xlsx`);
        return true;
    }
    catch (error) {
        console.error('Error exporting single release:', error);
        return false;
    }
};
const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
