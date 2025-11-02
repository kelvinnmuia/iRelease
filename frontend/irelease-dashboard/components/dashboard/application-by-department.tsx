"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { name: "Engineering", value: 120 },
  { name: "Marketing", value: 110 },
  { name: "Sales", value: 95 },
  { name: "Customer Support", value: 85 },
  { name: "Finance", value: 65 },
  { name: "Human Resources", value: 50 },
]

const COLORS = ["#6366f1", "#bfdb38", "#f59e0b", "#10b981", "#f87171", "#8b5cf6"]

export function ApplicationByDepartment() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Application by Department</CardTitle>
          <select className="text-sm px-2 py-1 border border-gray-300 rounded">
            <option>Today</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={2} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center mt-4">
          <p className="text-2xl font-bold text-gray-900">
            1,000 <span className="text-sm text-gray-600 block">Total Applicants</span>
          </p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {data.map((dept, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{dept.name}</span>
              <span className="font-semibold text-gray-900">{dept.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
