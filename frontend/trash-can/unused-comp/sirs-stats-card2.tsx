import { Card, CardContent } from "../../components/ui/card"
import { TrendingUp, TrendingDown, AlertTriangle, AlertCircle, AlertOctagon, AlertCircleIcon } from "lucide-react"

const sirsStats = [
  { 
    label: "Blocker SIRs", 
    value: "18", 
    trend: "+3.2%", 
    positive: false, 
    bgColor: "bg-red-100 dark:bg-red-900",
    icon: AlertOctagon,
    colorClass: "text-red-600 dark:text-red-400"
  },
  { 
    label: "Critical SIRs", 
    value: "42", 
    trend: "+8.7%", 
    positive: false, 
    bgColor: "bg-orange-100 dark:bg-orange-900",
    icon: AlertTriangle,
    colorClass: "text-orange-600 dark:text-orange-400"
  },
  { 
    label: "Major SIRs", 
    value: "127", 
    trend: "-4.3%", 
    positive: true, 
    bgColor: "bg-amber-100 dark:bg-amber-900",
    icon: AlertCircle,
    colorClass: "text-amber-600 dark:text-amber-400"
  },
  { 
    label: "Minor SIRs", 
    value: "155", 
    trend: "+12.5%", 
    positive: false, 
    bgColor: "bg-blue-100 dark:bg-blue-900",
    icon: AlertCircleIcon,
    colorClass: "text-blue-600 dark:text-blue-400"
  },
]

export function SirsStatCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {sirsStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">{stat.label}</p>
                <Icon className={`w-4 h-4 ${stat.colorClass}`} />
              </div>
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
        )
      })}
    </div>
  )
}