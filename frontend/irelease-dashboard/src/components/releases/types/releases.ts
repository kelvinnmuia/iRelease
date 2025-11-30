export interface Release {
  id: number;
  releaseId: string;
  systemName: string;
  systemId: string;
  releaseVersion: string;
  iteration: string;
  releaseDescription: string;
  functionalityDelivered: string;
  deliveredDate: string;
  tdNoticeDate: string;
  testDeployDate: string;
  testStartDate: string;
  testEndDate: string;
  prodDeployDate: string;
  testStatus: string;
  deploymentStatus: string;
  outstandingIssues: string;
  comments: string;
  releaseType: string;
  month: string;
  financialYear: string;
}

export interface ColumnConfig {
  key: keyof Release;
  label: string;
  width: string;
}

export interface StatusConfig {
  color: string;
  dot: string;
}

export type SortOrder = "newest" | "oldest" | null;
export type DateRange = {
  startDate: string;
  endDate: string;
};