import { Card, CardContent } from "../ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"
import { getReleasesData, processForStats, ReleaseStats } from "@/api/releases" // Changed import
export function StatsCards() {
  const [stats, setStats] = useState<ReleaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        // CHANGED: Use new pattern - fetch once, process locally
        const releases = await getReleasesData() // Changed this line
        const processedStats = processForStats(releases) // Changed this line
        setStats(processedStats)
        setError(null)
      } catch (err) {
        setError("Failed to load statistics")
        console.error("Error fetching stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Format numbers with commas (e.g., 1534 -> "1,534")
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  // Define card configurations
  const cardConfigs = [
    { 
      label: "All Releases", 
      key: "allReleases" as keyof ReleaseStats, 
      positive: true, 
      bgColor: "bg-lime-100 dark:bg-lime-900" 
    },
    { 
      label: "In Testing", 
      key: "inTesting" as keyof ReleaseStats, 
      positive: false, 
      bgColor: "bg-orange-100 dark:bg-orange-900" 
    },
    { 
      label: "Passed", 
      key: "passed" as keyof ReleaseStats, 
      positive: true, 
      bgColor: "bg-green-100 dark:bg-green-900" 
    },
    { 
      label: "Failed", 
      key: "failed" as keyof ReleaseStats, 
      positive: false, 
      bgColor: "bg-red-100 dark:bg-red-900" 
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {cardConfigs.map((config) => (
          <Card key={config.label} className="overflow-hidden border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2">{config.label}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg md:text-2xl font-bold text-gray-400 dark:text-gray-600">Error</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {cardConfigs.map((config) => {
        const value = stats[config.key] as number
        const trend = stats.trends?.[config.key as keyof ReleaseStats['trends']] || "+0%"
        
        return (
          <Card key={config.label} className="overflow-hidden">
            <CardContent className="p-4">
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2">{config.label}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg md:text-2xl font-bold">{formatNumber(value)}</p>
                </div>
                <div className={`${config.bgColor} px-2 py-1 rounded text-xs font-medium flex items-center gap-1`}>
                  {config.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {trend}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}