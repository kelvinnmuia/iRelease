"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const activities = [
  {
    icon: "👤",
    title: "Darren Wright viewed 15 candidate profiles",
    subtitle: "for the Software Developer position",
    time: "10:15 AM",
  },
  {
    icon: "📅",
    title: "Caren Smith scheduled interviews with 3",
    subtitle: "candidates for the Marketing Manager role",
    time: "9:50 AM",
  },
  {
    icon: "🔔",
    title: "Automated Reminder sent to Bob Lee to",
    subtitle: "complete interview feedback",
    time: "9:31 AM",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" className="h-auto p-0">
          ⋯
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, idx) => (
          <div key={idx} className="pb-4 last:pb-0 border-b last:border-b-0 border-gray-100">
            <div className="flex gap-3">
              <span className="text-lg">{activity.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.title}</span>
                  <br />
                  <span className="text-xs text-gray-600">{activity.subtitle}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
