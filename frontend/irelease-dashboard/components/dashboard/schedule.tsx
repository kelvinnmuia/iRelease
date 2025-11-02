"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const schedules = [
  {
    time: "1:00 PM",
    title: "Marketing Strategy Presentation",
    category: "Marketing",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    time: "2:30 PM",
    title: "HR Policy Update Session",
    category: "Human Resources",
    color: "bg-purple-100 text-purple-700",
  },
  {
    time: "4:00 PM",
    title: "Customer Feedback Analysis",
    category: "Customer Support",
    color: "bg-blue-100 text-blue-700",
  },
  {
    time: "5:30 PM",
    title: "Financial Reporting Session",
    category: "Finance",
    color: "bg-purple-100 text-purple-700",
  },
]

export function Schedule() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Schedule</CardTitle>
        <button className="text-sm text-gray-500 hover:text-gray-700">Today ▼</button>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedules.map((schedule, idx) => (
          <div key={idx} className="pb-4 last:pb-0 border-b last:border-b-0 border-gray-100">
            <div className="flex gap-3">
              <div className="text-xs text-gray-500 font-medium w-12 pt-1">{schedule.time}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{schedule.title}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  {schedule.category}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
