export function transformSirsReleaseData(jsonData) {
    return jsonData.map((item, index) => ({
        id: index + 1, // Auto-incremented numeric ID
        sir_release_id: item["sir_release_id"] || "",
        sir_id: Number(item["sir_id"] || 0),
        release_version: item["release_version"] || "",
        iteration: Number(item["iteration"] || 0),
        changed_date: item["changed_date"] || "",
        bug_severity: item["bug_severity"] || "",
        priority: item["priority"] || "",
        assigned_to: item["assigned_to"] || "",
        bug_status: item["bug_status"] || "",
        resolution: item["resolution"] || "",
        component: item["component"] || "",
        op_sys: item["op_sys"] || "",
        short_desc: item["short_desc"] || "",
        cf_sirwith: item["cf_sirwith"] || ""
    }));
}
