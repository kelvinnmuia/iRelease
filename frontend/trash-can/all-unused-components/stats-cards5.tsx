import { Card, CardContent } from "../ui/card"
import { TrendingUp, TrendingDown, RefreshCw, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { ireleaseDB, syncFromAppScript } from "@/db/ireleasedb"

interface StatCard {
  label: string
  value: number
  trend: string
  positive: boolean
  bgColor: string
}

export function StatsCards() {
  const [stats, setStats] = useState<StatCard[]>([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [hasData, setHasData] = useState(false)

  const fetchStatsFromDexie = async () => {
    try {
      setLoading(true)
      
      // Get ALL releases from Dexie
      const allReleases = await ireleaseDB.releases.toArray()
      
      console.log(`📊 Found ${allReleases.length} releases in Dexie`)
      
      // Check if we have any data
      const dataExists = allReleases.length > 0
      setHasData(dataExists)
      
      // Count releases by status
      let totalReleases = 0
      let inTestingCount = 0
      let passedCount = 0
      let failedCount = 0
      
      allReleases.forEach(release => {
        totalReleases++
        
        switch(release.Test_status) {
          case "In Testing":
            inTestingCount++
            break
          case "Passed":
            passedCount++
            break
          case "Failed":
            failedCount++
            break
          default:
            // Log unknown statuses for debugging
            if (release.Test_status) {
              console.log("Unknown status:", release.Test_status)
            }
        }
      })
      
      // For now, use placeholder trends
      const getTrend = () => ({
        trend: "+0%",
        positive: true
      })
      
      // Create dynamic stats from Dexie data
      const dynamicStats: StatCard[] = [
        {
          label: "All Releases",
          value: totalReleases,
          ...getTrend(),
          bgColor: "bg-lime-100 dark:bg-lime-900"
        },
        {
          label: "In Testing",
          value: inTestingCount,
          ...getTrend(),
          bgColor: "bg-orange-100 dark:bg-orange-900"
        },
        {
          label: "Passed",
          value: passedCount,
          ...getTrend(),
          bgColor: "bg-green-100 dark:bg-green-900"
        },
        {
          label: "Failed",
          value: failedCount,
          ...getTrend(),
          bgColor: "bg-red-100 dark:bg-red-900"
        },
      ]
      
      setStats(dynamicStats)
      
    } catch (error) {
      console.error("Error fetching stats from Dexie:", error)
      setStats([])
      setHasData(false)
    } finally {
      setLoading(false)
    }
  }

  // Handle initial data fetch from AppScript
  const handleFetchData = async () => {
    try {
      setFetching(true)
      console.log("📥 Fetching data from AppScript...")
      
      // Fetch data from AppScript
      const result = await syncFromAppScript()
      
      if (result.success) {
        console.log(`✅ Fetched ${result.count} releases`)
        // Fetch updated stats
        await fetchStatsFromDexie()
      } else {
        console.error("❌ Fetch failed")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setFetching(false)
    }
  }

  // Handle refresh data from AppScript
  const handleRefreshData = async () => {
    try {
      setFetching(true)
      console.log("🔄 Refreshing data from AppScript...")
      
      // Refresh data from AppScript
      const result = await syncFromAppScript()
      
      if (result.success) {
        console.log(`✅ Refreshed ${result.count} releases`)
        // Fetch updated stats
        await fetchStatsFromDexie()
      } else {
        console.error("❌ Refresh failed")
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchStatsFromDexie()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2"></div>
                <div className="flex items-end justify-between">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Button Section - Show different buttons based on data state */}
      <div className="flex justify-end">
        {!hasData ? (
          // Show Fetch Data button when no data exists
          <button
            onClick={handleFetchData}
            disabled={fetching}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            title="Fetch initial data from AppScript"
          >
            <Download className={`w-3 h-3 ${fetching ? 'animate-spin' : ''}`} />
            {fetching ? 'Fetching...' : 'Fetch Data'}
          </button>
        ) : (
          // Show Refresh Data button when data exists
          <button
            onClick={handleRefreshData}
            disabled={fetching}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
            title="Refresh data from AppScript"
          >
            <RefreshCw className={`w-3 h-3 ${fetching ? 'animate-spin' : ''}`} />
            {fetching ? 'Refreshing...' : 'Refresh Data'}
          </button>
        )}
      </div>
      
      {/* Stats Cards Grid - Always visible */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-4">
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2">
                {stat.label}
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg md:text-2xl font-bold">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`${stat.bgColor} px-2 py-1 rounded text-xs font-medium flex items-center gap-1`}>
                  {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}