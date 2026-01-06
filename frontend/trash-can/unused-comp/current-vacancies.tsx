import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { EllipsisVertical } from "lucide-react"
import { Button } from "../ui/button"

const vacancies = [
  {
    id: 1,
    title: "Software Developer",
    type: "Full-time",
    location: "Remote",
    salary: "$70K - $90K",
    applicants: 120,
    icon: "🖥️",
  },
  {
    id: 2,
    title: "Graphic Designer",
    type: "Part-time",
    location: "Hybrid",
    salary: "$40K - $55K",
    applicants: 75,
    icon: "🎨",
  },
  {
    id: 3,
    title: "Sales Manager",
    type: "Full-time",
    location: "On-site",
    salary: "$65K - $80K",
    applicants: 95,
    icon: "📊",
  },
  {
    id: 4,
    title: "HR Coordinator",
    type: "Contract",
    location: "Remote",
    salary: "$50K - $60K",
    applicants: 60,
    icon: "👥",
  },
]

export function CurrentVacancies() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base md:text-lg">Current Vacancies</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">(104)</span>
          <Button variant="ghost" size="sm" className="text-xs">
            See All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {vacancies.map((vacancy) => (
            <div key={vacancy.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 md:p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2">
                  <div className="text-xl">{vacancy.icon}</div>
                  <div>
                    <p className="font-semibold text-sm md:text-base">{vacancy.title}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {vacancy.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {vacancy.location}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <EllipsisVertical className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-end justify-between text-xs md:text-sm">
                <p className="font-medium text-gray-700 dark:text-gray-300">{vacancy.salary}</p>
                <p className="text-gray-500 dark:text-gray-400">{vacancy.applicants} Applicants</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
