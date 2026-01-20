import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts"
import { useEffect, useState } from "react"
import { getReleasesData, processForDeploymentStatus, DeploymentStatusData } from "@/api/releases"

export function DeploymentStatus() {
  const [releasesDetails, setReleasesDetails] = useState<DeploymentStatusData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch releases data
        const releases = await getReleasesData()
        
        // Process for deployment status
        const deploymentData = processForDeploymentStatus(releases)
        setReleasesDetails(deploymentData)
        
      } catch (err) {
        console.error("Error fetching deployment status:", err)
        setError("Failed to load deployment status data")
        setReleasesDetails([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalReleases = releasesDetails.reduce((sum, i) => sum + i.Total, 0)

  // Loading skeleton
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

          {/* Total Count skeleton */}
          <div className="flex items-baseline justify-center mt-4 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 ml-2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl text-center">
            Releases Deployment Status
          </CardTitle>
          <CardDescription className="text-center mt-3">
            Releases Breakdown by Deployment Status
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="h-80 w-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-red-500 font-medium">{error}</p>
              <p className="text-sm mt-2">Please try refreshing the page</p>
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

  // No data state
  if (releasesDetails.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl text-center">
            Releases Deployment Status
          </CardTitle>
          <CardDescription className="text-center mt-3">
            Releases Breakdown by Deployment Status
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="h-80 w-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="font-medium">No deployment data available</p>
              <p className="text-sm mt-2">Add releases to see deployment status breakdown</p>
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
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }} // moved chart slightly left
              barCategoryGap="3%" // reduces space between bars
            >
              <XAxis type="number" />
              <YAxis
                dataKey="Deployment_Status"
                type="category"
                tick={{ fontSize: 12 }}
                width={140} // slightly narrower axis label area
              />
              <Tooltip 
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                formatter={(value: number) => [`${value} releases`, 'Count']}
                labelFormatter={(label) => `Status: ${label}`}
              />
              <Bar dataKey="Total" barSize={20}> {/* reduced bar thickness */}
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

        {/* Total Count */}
        <div className="flex items-baseline justify-center mt-4">
          <span className="text-3xl font-bold text-gray-900">{totalReleases.toLocaleString()}</span>
          <span className="text-sm text-gray-600 ml-2">Total Releases</span>
        </div>
      </CardContent>
    </Card>
  )
}