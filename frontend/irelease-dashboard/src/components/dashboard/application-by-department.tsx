import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

const data = [
  { name: "Engineering", value: 120 },
  { name: "Marketing", value: 110 },
  { name: "Sales", value: 95 },
  { name: "Customer Support", value: 85 },
  { name: "Finance", value: 65 },
  { name: "Human Resources", value: 50 },
]

const COLORS = ["#3b82f6", "#84cc16", "#06b6d4", "#f59e0b", "#ec4899", "#8b5cf6"]

export function ApplicationByDepartment() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">Application by Department</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center items-center">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 60 }}>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
