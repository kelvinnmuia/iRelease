import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts"
import { useEffect, useState } from "react"
import { ireleaseDB, ReleaseRecord} from "@/db/ireleasedb"

// Define interface for deployment status data
interface DeploymentStatusData {
  Deployment_Status: string;
  Total: number;
  color: string;
}

// deployment status processing function (copied from your original api/releases.ts)
function processForDeploymentStatus(releases: ReleaseRecord[]): DeploymentStatusData[] {
  console.log('Processing deployment status data')
  
  if (!releases || releases.length === 0) {
    console.log('No releases data for deployment status')
    return []
  }
  
  // Mapping from raw data values to display labels
  const statusMapping: Record<string, { display: string; color: string }> = {
    'Deployed to QA': { display: 'QA Environment', color: '#ae1f26' },
    'Deployed to Pre-Prod': { display: 'Pre-Production', color: '#767276' },
    'Deployed to Production': { display: 'Production', color: '#0c0c0c' },
    'Deployed to Post-Prod': { display: 'Post-Production', color: '#d11314' },
    'Rolled Back': { display: 'Rolled back', color: '#7f151b' },
    'Not Deployed': { display: 'Not Deployed', color: '#4f4c4f' },
    'Deployment Failed': { display: 'Deployment Failed', color: '#050505' },
    'Scheduled for Deployment': { display: 'Scheduled Deployment', color: '#9a0d0e' }
  }
  
  // Initialize counters for all statuses
  const statusCounts: Record<string, number> = {}
  
  // Initialize with zero counts for all known statuses
  Object.keys(statusMapping).forEach(rawStatus => {
    const mappedStatus = statusMapping[rawStatus].display
    statusCounts[mappedStatus] = 0
  })
  
  // Count occurrences of each deployment status
  releases.forEach((release, index) => {
    const rawStatus = release.Deployment_status || 'Not Deployed'
    
    // Find the mapping for this status
    let mappedEntry = statusMapping[rawStatus]
    
    // If status is not in our mapping, try to find a close match
    if (!mappedEntry) {
      // Try case-insensitive matching
      const normalizedRawStatus = rawStatus.toLowerCase().trim()
      for (const [key, value] of Object.entries(statusMapping)) {
        if (key.toLowerCase().includes(normalizedRawStatus) || 
            normalizedRawStatus.includes(key.toLowerCase())) {
          mappedEntry = value
          break
        }
      }
      
      // If still not found, default to "Not Deployed"
      if (!mappedEntry) {
        console.log(`❓ Unknown deployment status: "${rawStatus}" - defaulting to "Not Deployed"`)
        mappedEntry = statusMapping['Not Deployed']
      }
    }
    
    const displayStatus = mappedEntry.display
    statusCounts[displayStatus] = (statusCounts[displayStatus] || 0) + 1
  })
  
  // Convert to array format matching the original structure
  const result = Object.entries(statusCounts)
    .map(([displayStatus, total]) => {
      // Find the color for this display status
      let color = '#4f4c4f' // Default color (Not Deployed)
      for (const [rawStatus, mapping] of Object.entries(statusMapping)) {
        if (mapping.display === displayStatus) {
          color = mapping.color
          break
        }
      }
      
      return {
        Deployment_Status: displayStatus,
        Total: total,
        color: color
      }
    })
    .filter(item => item.Total > 0) // Only include statuses with data
    .sort((a, b) => b.Total - a.Total) // Sort by count descending
  
  console.log('📊 Deployment status counts:', result)
  return result
}

export function DeploymentStatus() {
  const [releasesDetails, setReleasesDetails] = useState<DeploymentStatusData[]>([])
  const [loading, setLoading] = useState(true)

  // Function to fetch and process data from Dexie
  const fetchStatsFromDexie = async () => {
    try {
      setLoading(true)
      
      // Get ALL releases from Dexie
      const allReleases = await ireleaseDB.releases.toArray()
      
      console.log(`📊 Found ${allReleases.length} releases in Dexie for deployment status`)
      
      // Process the data using the same function as before
      const deploymentData = processForDeploymentStatus(allReleases)
      setReleasesDetails(deploymentData)
      
    } catch (error) {
      console.error("Error fetching deployment status from Dexie:", error)
      setReleasesDetails([])
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch on component mount
  useEffect(() => {
    fetchStatsFromDexie()
  }, [])

  const totalReleases = releasesDetails.reduce((sum, i) => sum + i.Total, 0)

  // Loading skeleton - SAME AS BEFORE
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl text-center animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
          </CardTitle>
          <CardDescription className="text-center mt-3 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full animate-pulse">
            <div className="h-full bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
          <div className="flex items-baseline justify-center mt-4 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 ml-2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // UPDATED: Empty state - Now matches ReleaseTypeChart design
  if (releasesDetails.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl text-center">Releases Deployment Status</CardTitle>
          <CardDescription className="text-center mt-3">
            Releases Breakdown by Deployment Status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.801 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.801 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                No deployment data available
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Fetch data using the 'Fetch Data' button
              </p>
            </div>
          </div>
          <div className="flex items-baseline justify-center mt-4">
            <span className="text-3xl font-bold text-gray-900">0</span>
            <span className="text-sm text-gray-600 ml-2">Total Releases</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Main render - SAME AS BEFORE
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg lg:text-xl text-center">Releases Deployment Status</CardTitle>
        <CardDescription className="text-center mt-3">
          Releases Breakdown by Deployment Status
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={releasesDetails}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              barCategoryGap="3%"
            >
              <XAxis type="number" />
              <YAxis
                dataKey="Deployment_Status"
                type="category"
                tick={{ fontSize: 12 }}
                width={140}
              />
              <Tooltip 
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                formatter={(value: number) => [`${value} release(s)`, 'Count']}
                labelFormatter={(label) => `Status: ${label}`}
              />
              <Bar dataKey="Total" barSize={20}>
                <LabelList
                  dataKey="Total"
                  position="right"
                  formatter={(value: number | string) => `${value}`}
                  style={{ fill: "#1e293b", fontWeight: "500" }}
                />
                {releasesDetails.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-baseline justify-center mt-4">
          <span className="text-3xl font-bold text-gray-900">{totalReleases.toLocaleString()}</span>
          <span className="text-sm text-gray-600 ml-2">Total Releases</span>
        </div>
      </CardContent>
    </Card>
  )
}