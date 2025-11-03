import { Card, CardContent } from "../ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

const stats = [
  { label: "All Releases", value: "1,534", trend: "+12%", positive: true, bgColor: "bg-lime-100 dark:bg-lime-900" },
  { label: "In Testing", value: "869", trend: "-3.8%", positive: false, bgColor: "bg-orange-100 dark:bg-orange-900" },
  { label: "Passed", value: "236", trend: "+8.3%", positive: true, bgColor: "bg-green-100 dark:bg-green-900" },
  { label: "Failed", value: "429", trend: "-2.8%", positive: false, bgColor: "bg-red-100 dark:bg-red-900" },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="p-4">
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
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
