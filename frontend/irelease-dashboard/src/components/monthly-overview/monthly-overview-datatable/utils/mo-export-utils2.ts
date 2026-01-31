import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Release } from '../types/mo-releases';
import { ColumnConfig } from '../types/mo-releases';

// Helper function to transform Release data for export
const transformReleaseForExport = (release: Release, visibleColumns: ColumnConfig[]) => {
  const exportData: Record<string, any> = {};
  
  visibleColumns.forEach(col => {
    exportData[col.label] = release[col.key];
  });
  
  return exportData;
};

export const exportToCSV = (data: Release[], visibleColumns: ColumnConfig[], selectedRows: Set<number>) => {
  try {
    const dataToExport = selectedRows.size > 0
      ? data.filter(item => selectedRows.has(item.id))
      : data;

    const filteredDataForExport = dataToExport.map(release => 
      transformReleaseForExport(release, visibleColumns)
    );

    const csv = Papa.unparse(filteredDataForExport, { header: true });
    downloadFile(csv, `releases-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
};

export const exportToExcel = (data: Release[], visibleColumns: ColumnConfig[], selectedRows: Set<number>) => {
  try {
    const dataToExport = selectedRows.size > 0
      ? data.filter(item => selectedRows.has(item.id))
      : data;

    const filteredDataForExport = dataToExport.map(release => 
      transformReleaseForExport(release, visibleColumns)
    );

    const worksheet = XLSX.utils.json_to_sheet(filteredDataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Releases');

    const cols = visibleColumns.map((col) => ({ wch: Math.max(col.label.length, 15) }));
    worksheet['!cols'] = cols;

    XLSX.writeFile(workbook, `releases-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

export const exportToJSON = (data: Release[], visibleColumns: ColumnConfig[], selectedRows: Set<number>) => {
  try {
    const dataToExport = selectedRows.size > 0
      ? data.filter(item => selectedRows.has(item.id))
      : data;

    const filteredDataForExport = dataToExport.map(release => 
      transformReleaseForExport(release, visibleColumns)
    );

    const json = JSON.stringify(filteredDataForExport, null, 2);
    downloadFile(json, `releases-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    return true;
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    return false;
  }
};

export const exportSingleRelease = (release: Release) => {
  try {
    const exportData = {
      'Release ID': release.releaseId,
      'System Name': release.systemName,
      'System ID': release.systemId,
      'Release Version': release.releaseVersion,
      'Iteration': release.iteration,
      'Release Description': release.releaseDescription,
      'Functionality Delivered': release.functionalityDelivered,
      'Date Delivered': release.deliveredDate,
      'TD Notice Date': release.tdNoticeDate,
      'Test Deploy Date': release.testDeployDate,
      'Test Start Date': release.testStartDate,
      'Test End Date': release.testEndDate,
      'Prod Deploy Date': release.prodDeployDate,
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
  } catch (error) {
    console.error('Error exporting single release:', error);
    return false;
  }
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
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