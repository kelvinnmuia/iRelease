import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const data = [
  { name: "Engineering", value: 300 },
  { name: "Marketing", value: 200 },
  { name: "Sales", value: 250 },
  { name: "Customer Support", value: 260 },
  { name: "Finance", value: 264 },
  { name: "Human Resources", value: 260 },
]

const COLORS = ["#3b82f6", "#84cc16", "#22c55e", "#d1d5db", "#c4b5fd", "#ddd6fe"]

export function ApplicationByDepartment() {
  const totalApplications = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg lg:text-xl text-center">Releases by System Name</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Chart section with total applications below */}
          <div className="flex flex-col items-center flex-1">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col items-center mt-2">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{totalApplications}</div>
              <div className="text-xs md:text-sm text-gray-500">Total Releases</div>
            </div>
          </div>

          <div className="w-px bg-gray-200" />

          {/* Legend section on the right */}
          <div className="flex-1 space-y-3">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
