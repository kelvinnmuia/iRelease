// app/sirs-per-release/types/sir.ts
export interface SIR {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo: string;
  createdDate: string;
  resolvedDate?: string;
  module: string;
  description: string;
  releaseVersion: string;
  iteration?: number;
}

export interface Release {
  version: string;
  iteration?: number;
  releaseDate: string;
  sirCount: number;
  openSirs: number;
  resolvedSirs: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface SIRSummary {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}