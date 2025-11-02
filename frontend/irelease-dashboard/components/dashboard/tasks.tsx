"use client"

import { Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const tasks = [
  {
    title: "Resume Screening",
    subtitle: "Evaluation • May 27, 2027",
    icon: "📄",
    color: "bg-purple-100",
  },
  {
    title: "Interview Scheduling",
    subtitle: "Engagement • May 28, 2027",
    icon: "📅",
    color: "bg-blue-100",
  },
  {
    title: "Candidate Communication",
    subtitle: "Follow-up • May 29, 2027",
    icon: "💬",
    color: "bg-pink-100",
  },
  {
    title: "Offer Management",
    subtitle: "Selection • May 29, 2027",
    icon: "🎁",
    color: "bg-purple-100",
  },
]

export function Tasks() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Tasks</CardTitle>
        <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-black h-6 w-6 p-0">
          <Plus className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task, idx) => (
          <div key={idx} className={`p-3 rounded-lg ${task.color}`}>
            <div className="flex items-start gap-3">
              <span className="text-lg">{task.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{task.title}</p>
                <p className="text-xs text-gray-600">{task.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
