import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const data = [
  { name: "Job Boards", value: 350 },
  { name: "Employee Referrals", value: 200 },
  { name: "Social Media Campaigns", value: 300 },
  { name: "Recruitment Agencies", value: 150 },
]

const COLORS = ["#bfff00", "#ffffff", "#d1d5db", "#f3f4f6"]

export function ApplicantResources() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base md:text-lg">Applicant Resources</CardTitle>
        <p className="text-2xl md:text-3xl font-bold mt-3">1,000</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Total Applicants</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={85}
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
          <div className="space-y-2 text-xs md:text-sm">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                <span className="font-medium ml-2 flex-shrink-0">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
