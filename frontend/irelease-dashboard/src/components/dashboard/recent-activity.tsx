import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { EllipsisVertical } from "lucide-react"

const activities = [
  {
    id: 1,
    user: "Darren Wright",
    action: "viewed 15 candidate profiles for the Software Developer position",
    time: "10:15 AM",
    icon: "👤",
  },
  {
    id: 2,
    user: "Caren Smith",
    action: "scheduled interviews with 3 candidates for the Marketing Manager role",
    time: "9:30 AM",
    icon: "📅",
  },
  {
    id: 3,
    user: "System",
    action: "Automated Reminder sent to Bob Lee to complete interview feedback",
    time: "9:31 AM",
    icon: "⚙️",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Today</p>
        </div>
        <Button variant="ghost" size="icon">
          <EllipsisVertical className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-2 text-xs">
            <span className="text-lg flex-shrink-0">{activity.icon}</span>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">{activity.user}</span> {activity.action}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
