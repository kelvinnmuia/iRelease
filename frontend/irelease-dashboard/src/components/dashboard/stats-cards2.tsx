import { Card, CardContent } from "../ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useState, useEffect } from "react"
import { ireleaseDB } from "@/db/ireleasedb" // Update this path

interface StatCard {
  label: string
  value: number
  trend: string
  positive: boolean
  bgColor: string
}

export function StatsCards() {
  // Initialize with empty stats that will be filled dynamically
  const [stats, setStats] = useState<StatCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatsFromDexie = async () => {
      try {
        setLoading(true)
        
        // Get ALL releases from Dexie
        const allReleases = await ireleaseDB.releases.toArray()
        
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
              // Handle other statuses if they exist
              console.log("Unknown status:", release.Test_status)
          }
        })
        
        // For now, use placeholder trends (you can replace with real calculations)
        const getTrend = (count: number) => ({
          trend: count > 0 ? "+0%" : "0%",
          positive: count > 0
        })
        
        // Create dynamic stats from Dexie data
        const dynamicStats: StatCard[] = [
          {
            label: "All Releases",
            value: totalReleases,
            ...getTrend(totalReleases),
            bgColor: "bg-lime-100 dark:bg-lime-900"
          },
          {
            label: "In Testing",
            value: inTestingCount,
            ...getTrend(inTestingCount),
            bgColor: "bg-orange-100 dark:bg-orange-900"
          },
          {
            label: "Passed",
            value: passedCount,
            ...getTrend(passedCount),
            bgColor: "bg-green-100 dark:bg-green-900"
          },
          {
            label: "Failed",
            value: failedCount,
            ...getTrend(failedCount),
            bgColor: "bg-red-100 dark:bg-red-900"
          },
        ]
        
        setStats(dynamicStats)
        
      } catch (error) {
        console.error("Error fetching stats from Dexie:", error)
        // Fallback to empty stats on error
        setStats([])
      } finally {
        setLoading(false)
      }
    }

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
  if (stats.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="overflow-hidden col-span-4">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No data available. Check if Dexie is properly seeded.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render dynamic stats
  return (
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
  )
}