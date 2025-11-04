import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", All: 100, Passed: 70, Failed: 30 },
  { month: "Feb", All: 150, Passed: 120, Failed: 30 },
  { month: "Mar", All: 200, Passed: 150, Failed: 50 },
  { month: "Apr", All: 180, Passed: 140, Failed: 40 },
  { month: "May", All: 220, Passed: 170, Failed: 50 },
  { month: "Jun", All: 240, Passed: 190, Failed: 50 },
  { month: "Jul", All: 260, Passed: 200, Failed: 60 },
  { month: "Aug", All: 300, Passed: 250, Failed: 50 },
  { month: "Sep", All: 280, Passed: 230, Failed: 50 },
  { month: "Oct", All: 320, Passed: 270, Failed: 50 },
  { month: "Nov", All: 350, Passed: 300, Failed: 50 },
  { month: "Dec", All: 400, Passed: 350, Failed: 50 },
]

export function ApplicationsChart() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg lg:text-2xl text-center">Releases by Month</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip />
            <Legend
              layout="horizontal"
              verticalAlign="top"
              align="center"
              iconType="circle"
              wrapperStyle={{
                paddingBottom: 8,   // adds space below legend
                marginLeft: 8
                }}
            />
            <Bar dataKey="All" fill="#0c0c0c" />
            <Bar dataKey="Passed" fill="#767276" />
            <Bar dataKey="Failed" fill="#d11314" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
