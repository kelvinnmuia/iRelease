import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts"

const jobLevelDetails = [
  { name: "QA Environment", Total: 300, color: "#ae1f26" },
  { name: "Pre-Production", Total: 424, color: "#767276" },
  { name: "Production", Total: 380, color: "#0c0c0c" },
  { name: "Post-Production", Total: 430, color: "#d11314" }, 
]

export function DeploymentStatus() {
  const totalPeople = jobLevelDetails.reduce((sum, i) => sum + i.Total, 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg lg:text-xl text-center">Releases Deployment Status</CardTitle>
        <CardDescription className="text-center mt-3">
          Releases Breakdown by Deployment Status
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={jobLevelDetails}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }} // moved chart slightly left
              barCategoryGap="3%" // reduces space between bars
            >
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 12 }}
                width={140} // slightly narrower axis label area
              />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
              <Bar dataKey="Total" barSize={20}> {/* reduced bar thickness */}
                <LabelList
                  dataKey="Total"
                  position="right"
                  formatter={(value: number | string) => `${value} people`}
                  style={{ fill: "#1e293b", fontWeight: "500" }}
                />
                {jobLevelDetails.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Total Count */}
        <div className="flex items-baseline justify-center mt-4">
          <span className="text-3xl font-bold text-gray-900">{totalPeople.toLocaleString()}</span>
          <span className="text-sm text-gray-600 ml-2">Total Releases</span>
        </div>
      </CardContent>
    </Card>
  )
}
