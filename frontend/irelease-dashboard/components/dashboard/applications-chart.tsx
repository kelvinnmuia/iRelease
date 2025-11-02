"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { date: "13 May", Applied: 120, Shortlisted: 80 },
  { date: "14 May", Applied: 200, Shortlisted: 140 },
  { date: "15 May", Applied: 150, Shortlisted: 100 },
  { date: "16 May", Applied: 180, Shortlisted: 120 },
  { date: "17 May", Applied: 140, Shortlisted: 90 },
  { date: "18 May", Applied: 190, Shortlisted: 130 },
]

export function ApplicationsChart() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <CardTitle className="text-lg md:text-xl">Applications</CardTitle>
          <select className="text-sm px-3 py-2 border border-gray-300 rounded w-full md:w-auto">
            <option>13-18 May</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250} minHeight={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
              }}
            />
            <Legend />
            <Bar dataKey="Applied" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Shortlisted" fill="#bfdb38" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="text-center mt-4">
          <p className="text-xs md:text-sm text-gray-600">
            <span className="text-xl md:text-2xl font-bold text-gray-900">525</span> Total Applications
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
