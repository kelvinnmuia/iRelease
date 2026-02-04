interface Release {
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
interface MoReleasesTypeChartProps {
    releasesData: Release[];
}
export declare function MoReleasesTypeChart({ releasesData }: MoReleasesTypeChartProps): import("react/jsx-runtime").JSX.Element;
export {};
