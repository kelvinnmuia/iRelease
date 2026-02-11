interface SirReleaseData {
    "sir_release_id": number;
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
interface SirReleaseChartProps {
    sirReleaseData: SirReleaseData[];
    selectedReleaseName: string;
    selectedIterationName: string;
}
export declare function SirReleasesChart({ sirReleaseData, selectedReleaseName, selectedIterationName }: SirReleaseChartProps): import("react/jsx-runtime").JSX.Element;
export {};
