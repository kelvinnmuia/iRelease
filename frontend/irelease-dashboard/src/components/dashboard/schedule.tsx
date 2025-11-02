import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

const scheduleItems = [
  { id: 1, title: "Marketing Strategy Presentation", category: "Marketing", time: "1:00 PM" },
  { id: 2, title: "HR Policy Update Session", category: "Human Resources", time: "2:30 PM" },
  { id: 3, title: "Customer Feedback Analysis", category: "Customer Support", time: "4:00 PM" },
  { id: 4, title: "Financial Reporting Session", category: "Finance", time: "5:30 PM" },
]

export function Schedule() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {scheduleItems.map((item) => (
          <div key={item.id} className="border-l-4 border-lime-300 pl-3 py-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {item.time}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
