export interface SirReleaseData {
    "id": number;              
    "sir_release_id": string;        
    "sir_id": number;
    "release_version": string;
    "iteration": number;
    "changed_date": string;
    "bug_severity": string;
    "priority": string;
    "assigned_to": string;
    "bug_status": string;
    "resolution": string;
    "component": string;
    "op_sys": string;
    "short_desc": string;
    "cf_sirwith": string;
}

export interface ColumnConfig {
  key: keyof SirReleaseData;
  label: string;
  width: string;
}