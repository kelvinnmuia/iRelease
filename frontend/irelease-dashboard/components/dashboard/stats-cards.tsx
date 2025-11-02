"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const stats = [
  {
    label: "Applications",
    value: "1,534",
    trend: "+12.6%",
    trendUp: true,
    icon: "📝",
    bg: "bg-yellow-100",
  },
  {
    label: "Shortlisted",
    value: "869",
    trend: "-3.8%",
    trendUp: false,
    icon: "⭐",
    bg: "bg-orange-100",
  },
  {
    label: "Hired",
    value: "236",
    trend: "+8.2%",
    trendUp: true,
    icon: "✓",
    bg: "bg-green-100",
  },
  {
    label: "Rejected",
    value: "429",
    trend: "-2.1%",
    trendUp: false,
    icon: "✗",
    bg: "bg-red-100",
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center gap-1 mt-3">
                  {stat.trendUp ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={stat.trendUp ? "text-green-500" : "text-red-500"}>{stat.trend}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
