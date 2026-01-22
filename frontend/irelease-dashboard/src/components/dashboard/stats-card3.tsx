import { Card, CardContent } from "../ui/card"
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { ireleaseDB, syncFromAppScript } from "@/db/ireleasedb" // Make sure you import syncFromAppScript

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
  const [refreshing, setRefreshing] = useState(false)

  const fetchStatsFromDexie = async () => {
    try {
      setLoading(true)
      
      // Get ALL releases from Dexie
      const allReleases = await ireleaseDB.releases.toArray()
      
      console.log(`📊 Found ${allReleases.length} releases in Dexie`)
      
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
    } finally {
      setLoading(false)
    }
  }

  // Handle manual refresh from AppScript
  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      console.log("🔄 Refreshing data from AppScript...")
      
      // Sync data from AppScript
      const result = await syncFromAppScript()
      
      if (result.success) {
        console.log(`✅ Synced ${result.count} releases`)
        // Fetch updated stats
        await fetchStatsFromDexie()
      } else {
        console.error("❌ Sync failed")
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setRefreshing(false)
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

  // Empty state (if no data in Dexie)
  if (stats.length === 0 || stats.every(stat => stat.value === 0)) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="overflow-hidden col-span-4">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <p className="text-gray-500 dark:text-gray-400">
                No data available in database.
              </p>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Fetching Data...' : 'Fetch Data from AppScript'}
              </button>
              <p className="text-xs text-gray-400">
                Database might be empty. Click to fetch data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render dynamic stats with refresh button
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      
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