import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { date: "13 May", Applied: 100, Shortlisted: 80 },
  { date: "14 May", Applied: 150, Shortlisted: 120 },
  { date: "15 May", Applied: 200, Shortlisted: 150 },
  { date: "16 May", Applied: 180, Shortlisted: 140 },
  { date: "17 May", Applied: 220, Shortlisted: 170 },
  { date: "18 May", Applied: 240, Shortlisted: 190 },
]

export function ApplicationsChart() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">Applications</CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Applied</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-lime-400 rounded-full" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Shortlisted</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Applied" fill="#3b82f6" />
            <Bar dataKey="Shortlisted" fill="#bfff00" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
