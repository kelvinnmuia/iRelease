"use client"

import { Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const vacancies = [
  {
    title: "Software Developer",
    type: "Full-time",
    mode: "Remote",
    salary: "$70K - $90K",
    salaryExtra: "",
    applicants: 120,
    icon: "💻",
  },
  {
    title: "Graphic Designer",
    type: "Part-time",
    mode: "Hybrid",
    salary: "$40K - $55K",
    salaryExtra: "per-call",
    applicants: 75,
    icon: "🎨",
  },
  {
    title: "Sales Manager",
    type: "Full-time",
    mode: "On-site",
    salary: "$65K - $80K",
    salaryExtra: "commission",
    applicants: 75,
    icon: "📊",
  },
  {
    title: "HR Coordinator",
    type: "Contract",
    mode: "Remote",
    salary: "$50K - $60K",
    salaryExtra: "",
    applicants: 60,
    icon: "👥",
  },
]

export function CurrentVacancies() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-lg md:text-xl">Current Vacancies (104)</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select className="text-sm px-3 py-2 border border-gray-300 rounded">
              <option>Sort by: Popular</option>
            </select>
            <Button variant="ghost" size="sm">
              See All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {vacancies.map((vacancy, idx) => (
            <Card key={idx} className="border border-gray-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                    <span className="text-lg sm:text-2xl flex-shrink-0">{vacancy.icon}</span>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">{vacancy.title}</h3>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">{vacancy.type}</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">{vacancy.mode}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    ⋯
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{vacancy.salary}</p>
                    {vacancy.salaryExtra && <p className="text-xs text-gray-500">{vacancy.salaryExtra}</p>}
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>{vacancy.applicants} Applicants</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
