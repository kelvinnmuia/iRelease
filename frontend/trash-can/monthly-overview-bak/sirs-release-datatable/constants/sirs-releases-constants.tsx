// Define SIR Release columns
export const allColumns = [
  { key: "sir_release_id", label: "Sir_Rel_Id", width: "w-32" },
  { key: "sir_id", label: "Sir_Id", width: "w-40" },
  { key: "release_version", label: "Release Version", width: "w-32" },
  { key: "iteration", label: "Iteration", width: "w-28" },
  { key: "changed_date", label: "Changed Date", width: "w-48" },
  { key: "bug_severity", label: "Bug Severity", width: "w-48" },
  { key: "priority", label: "Priority", width: "w-32" },
  { key: "assigned_to", label: "Assigned To", width: "w-32" },
  { key: "bug_status", label: "Bug Status", width: "w-32" },
  { key: "resolution", label: "Resolution", width: "w-32" },
  { key: "component", label: "Component", width: "w-32" },
  { key: "op_sys", label: "Op Sys", width: "w-32" },
  { key: "short_desc", label: "Short Description", width: "w-48" },
  { key: "cf_sirwith", label: "Cf Sir With", width: "w-32" },
]


// bug severity configurations
export const bugSeverity: Record<string, { color: string; dot: string }> = {
  "Critical": { color: "text-gray-600", dot: "bg-yellow-400" },
  "Minor": { color: "text-gray-600", dot: "bg-gray-500" },
  "Major": { color: "text-gray-600", dot: "bg-slate-600" },
  "Blocker": { color: "text-gray-600", dot: "bg-red-500" },
}

export const bugStatus: Record<string, { color: string; dot: string }> = {
  "Resolved": { color: "text-gray-600", dot: "bg-green-500" },
  "Verified": { color: "text-gray-600", dot: "bg-slate-600" },
  "Closed": { color: "text-gray-600", dot: "bg-gray-500" },
  "Open": { color: "text-gray-600", dot: "bg-blue-500" },
  "In Progress": { color: "text-gray-600", dot: "bg-yellow-500" },
}

export const resolutionStatus: Record<string, { color: string; dot: string }> = {
  "Fixed": { color: "text-gray-600", dot: "bg-green-500" },
  "Verified": { color: "text-gray-600", dot: "bg-slate-600" },
  "Closed": { color: "text-gray-600", dot: "bg-gray-500" },
  "Unresolved": { color: "text-gray-600", dot: "bg-red-500" },
  "Working": { color: "text-gray-600", dot: "bg-yellow-500" },
}

// Priority configuration
export const priorityConfig: Record<string, { color: string; bgColor: string }> = {
  "P1": { color: "text-red-600", bgColor: "bg-red-50" },
  "P2": { color: "text-orange-600", bgColor: "bg-orange-50" },
  "P3": { color: "text-yellow-600", bgColor: "bg-yellow-50" },
  "P4": { color: "text-blue-600", bgColor: "bg-blue-50" },
}

// Options for dropdowns
export const bugSeverityOptions = ["Critical", "Minor", "Major", "Blocker"]
export const bugStatusOptions = ["Open", "In Progress", "Resolved", "Verified", "Closed"]
export const resolutionOptions = ["Unresolved", "Working", "Fixed", "Verified", "Closed"]
export const priorityOptions = ["P1", "P2", "P3", "P4"]
export const componentOptions = ["MV", "MAN", "EXM", "API", "UI", "DB", "ALL"]
export const osOptions = ["All", "Linux", "Windows", "MacOS"]

// LocalStorage keys
export const STORAGE_KEYS = {
  COLUMN_VISIBILITY: 'releases-dashboard-column-visibility',
  DATE_RANGE_FILTER: 'releases-dashboard-date-range-filter',
  DATE_RANGE_DETAILS: 'releases-dashboard-date-range-details',
  ITEMS_PER_PAGE: 'releases-dashboard-items-per-page',
} as const;


