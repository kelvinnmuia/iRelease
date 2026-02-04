import { Release } from "../monthly-overview/monthly-overview-datatable/types/mo-releases";

export function transformMoReleasesData(jsonData: any[]): Release[] {
  return jsonData.map((item, index) => ({
    id: index + 1, // Add missing id field
    releaseId: item["Release ID"] || "",
    systemName: item["System Name"] || "",
    systemId: item["System ID"] || "",
    releaseVersion: item["Release Version"] || "",
    iteration: item["Iteration"] || "",
    releaseDescription: item["Release Description"] || "",
    functionalityDelivered: item["Functionality Delivered"] || "",
    deliveredDate: item["Date Delivered"] || "",
    tdNoticeDate: item["TD Notice Date"] || "",
    testDeployDate: item["Test Deploy Date"] || "",
    testStartDate: item["Test Start Date"] || "",
    testEndDate: item["Test End Date"] || "",
    prodDeployDate: item["Prod Deploy Date"] || "",
    testStatus: item["Test Status"] || "",
    deploymentStatus: item["Deployment Status"] || "",
    outstandingIssues: item["Outstanding Issues"] || "",
    comments: item["Comments"] || "",
    releaseType: item["Release Type"] || "",
    month: item["Month"] || "",
    financialYear: item["Financial Year"] || ""
  }));
}