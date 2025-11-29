import { ColumnConfig as ConstantsColumnConfig, StatusConfig as ConstantsStatusConfig } from './constants';

// Re-export types from constants to maintain consistency
export type ColumnConfig = ConstantsColumnConfig;
export type StatusConfig = ConstantsStatusConfig;

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

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface FormData {
  releaseVersion: string;
  systemName: string;
  systemId: string;
  iteration: string;
  releaseType: string;
  testStatus: string;
  deploymentStatus: string;
  deliveredDate: string;
  tdNoticeDate: string;
  testDeployDate: string;
  testStartDate: string;
  testEndDate: string;
  prodDeployDate: string;
  month: string;
  financialYear: string;
  releaseDescription: string;
  functionalityDelivered: string;
  outstandingIssues: string;
  comments: string;
}