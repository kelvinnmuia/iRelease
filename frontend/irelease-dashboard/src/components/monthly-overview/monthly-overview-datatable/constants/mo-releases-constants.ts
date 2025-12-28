import { ColumnConfig, StatusConfig } from '../types/mo-releases';

export const allColumns: ColumnConfig[] = [
  { key: "releaseId", label: "Release ID", width: "w-32" },
  { key: "systemName", label: "System Name", width: "w-40" },
  { key: "systemId", label: "System ID", width: "w-28" },
  { key: "releaseVersion", label: "Release Version", width: "w-32" },
  { key: "iteration", label: "Iteration", width: "w-28" },
  { key: "releaseDescription", label: "Release Description", width: "w-48" },
  { key: "functionalityDelivered", label: "Functionality Delivered", width: "w-48" },
  { key: "deliveredDate", label: "Date Delivered", width: "w-32" },
  { key: "tdNoticeDate", label: "TD Notice Date", width: "w-32" },
  { key: "testDeployDate", label: "Test Deploy Date", width: "w-32" },
  { key: "testStartDate", label: "Test Start Date", width: "w-32" },
  { key: "testEndDate", label: "Test End Date", width: "w-32" },
  { key: "prodDeployDate", label: "Prod Deploy Date", width: "w-32" },
  { key: "testStatus", label: "Test Status", width: "w-28" },
  { key: "deploymentStatus", label: "Deployment Status", width: "w-32" },
  { key: "outstandingIssues", label: "Outstanding Issues", width: "w-48" },
  { key: "comments", label: "Comments", width: "w-48" },
  { key: "releaseType", label: "Release Type", width: "w-28" },
  { key: "month", label: "Month", width: "w-28" },
  { key: "financialYear", label: "Financial Year", width: "w-32" },
];

export const statusConfig: Record<string, StatusConfig> = {
  "In Testing": { color: "text-gray-600", dot: "bg-yellow-400" },
  "Passed": { color: "text-gray-600", dot: "bg-green-500" },
  "Failed": { color: "text-gray-600", dot: "bg-red-500" },
  "Not Tested": { color: "text-gray-600", dot: "bg-slate-500" }
};

export const deploymentStatusConfig: Record<string, StatusConfig> = {
  "Deployed to QA": { color: "text-gray-600", dot: "bg-blue-500" },
  "Deployed to Pre-Prod": { color: "text-gray-600", dot: "bg-purple-500" },
  "Deployed to Production": { color: "text-gray-600", dot: "bg-green-500" },
  "Deployed to Post-Prod": { color: "text-gray-600", dot: "bg-teal-500" },
  "Rolled Back": { color: "text-gray-600", dot: "bg-red-500" },
  "Not Deployed": { color: "text-gray-600", dot: "bg-gray-400" },
  "Deployment Failed": { color: "text-gray-600", dot: "bg-orange-500" },
  "Scheduled for Deployment": { color: "text-gray-600", dot: "bg-yellow-400" },
};

export const testStatusOptions = ["In Testing", "Passed", "Failed"];
export const deploymentStatusOptions = [
  "Deployed to QA",
  "Deployed to Pre-Prod",
  "Deployed to Production",
  "Deployed to Post-Prod",
  "Rolled Back",
  "Not Deployed",
  "Deployment Failed",
  "Scheduled for Deployment"
];
export const releaseTypeOptions = ["Major", "Medium", "Minor"];
export const monthOptions = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
export const financialYearOptions = ["FY2023", "FY2024", "FY2025", "FY2026"];

// LocalStorage keys
export const STORAGE_KEYS = {
  COLUMN_VISIBILITY: 'releases-dashboard-column-visibility',
  DATE_RANGE_FILTER: 'releases-dashboard-date-range-filter',
  DATE_RANGE_DETAILS: 'releases-dashboard-date-range-details',
  ITEMS_PER_PAGE: 'releases-dashboard-items-per-page',
} as const;