import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Plus } from "lucide-react"

const tasks = [
  {
    id: 1,
    title: "Resume Screening",
    type: "Evaluation",
    date: "May 27, 2027",
    color: "bg-purple-100 dark:bg-purple-900",
  },
  {
    id: 2,
    title: "Interview Scheduling",
    type: "Engagement",
    date: "May 20, 2027",
    color: "bg-blue-100 dark:bg-blue-900",
  },
  {
    id: 3,
    title: "Candidate Communication",
    type: "Recruitment",
    date: "May 25, 2027",
    color: "bg-yellow-100 dark:bg-yellow-900",
  },
  {
    id: 4,
    title: "Offer Management",
    type: "Selection",
    date: "May 25, 2027",
    color: "bg-indigo-100 dark:bg-indigo-900",
  },
]

export function Tasks() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Tasks</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-lime-300 hover:bg-lime-400">
          <Plus className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className={`${task.color} w-2 h-2 rounded-full mt-1 flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{task.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {task.type} • {task.date}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
