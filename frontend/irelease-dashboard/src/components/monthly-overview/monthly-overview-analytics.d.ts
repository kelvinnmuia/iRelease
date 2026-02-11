import { Release } from './monthly-overview-datatable/types/mo-releases';
interface MonthlyOverviewAnalyticsProps {
    filteredData: Release[];
    month?: string;
    year?: string;
}
export declare function MonthlyOverviewAnalytics({ filteredData, month, year }: MonthlyOverviewAnalyticsProps): import("react/jsx-runtime").JSX.Element;
export {};
