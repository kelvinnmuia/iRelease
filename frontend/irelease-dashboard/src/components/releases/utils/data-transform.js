export function transformReleasesData(jsonData) {
    return jsonData.map((item) => ({
        id: item.id || 0, // Use Dexie's auto-generated ID
        releaseId: item["Release_id"] || "",
        systemName: item["System_name"] || "",
        systemId: item["System_id"] || "",
        releaseVersion: item["Release_version"] || "",
        iteration: item["Iteration"] || "",
        releaseDescription: item["Release_description"] || "",
        functionalityDelivered: item["Functionality_delivered"] || "",
        deliveredDate: item["Date_delivered_by_vendor"] || "",
        tdNoticeDate: item["Notification_date_for_deployment_to_test"] || "",
        testDeployDate: item["Date_deployed_to_test"] || "",
        testStartDate: item["Date_of_test_commencement"] || "",
        testEndDate: item["Date_of_test_completion"] || "",
        prodDeployDate: item["Date_deployed_in_production"] || "",
        testStatus: item["Test_status"] || "",
        deploymentStatus: item["Deployment_status"] || "",
        outstandingIssues: item["Outstanding_issues"] || "",
        comments: item["Comments"] || "",
        releaseType: item["Type_of_release"] || "",
        month: item["Month"] || "",
        financialYear: item["Financial_year"] || ""
    }));
}
