import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts"

const releasesDetails = [
  { Deployment_Status: "QA Environment", Total: 300, color: "#ae1f26" },
  { Deployment_Status: "Pre-Production", Total: 424, color: "#767276" },
  { Deployment_Status: "Production", Total: 380, color: "#0c0c0c" },
  { Deployment_Status: "Post-Production", Total: 430, color: "#d11314" },
  { Deployment_Status: "Rolled back", Total: 20, color: "#7f151b" },
  { Deployment_Status: "Not Deployed", Total: 150, color: "#4f4c4f" },
  { Deployment_Status: "Deployment Failed", Total: 100, color: "#050505" },
  { Deployment_Status: "Scheduled Deployment", Total: 50, color: "#9a0d0e" },
]

export function DeploymentStatus() {
  const totalReleases = releasesDetails.reduce((sum, i) => sum + i.Total, 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg lg:text-xl text-center">Releases Deployment Status</CardTitle>
        <CardDescription className="text-center mt-3">
          Releases Breakdown by Deployment Status
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={releasesDetails}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }} // moved chart slightly left
              barCategoryGap="3%" // reduces space between bars
            >
              <XAxis type="number" />
              <YAxis
                dataKey="Deployment_Status"
                type="category"
                tick={{ fontSize: 12 }}
                width={140} // slightly narrower axis label area
              />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
              <Bar dataKey="Total" barSize={20}> {/* reduced bar thickness */}
                <LabelList
                  dataKey="Total"
                  position="right"
                  formatter={(value: number | string) => `${value}`}
                  style={{ fill: "#1e293b", fontWeight: "500" }}
                />
                {releasesDetails.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Total Count */}
        <div className="flex items-baseline justify-center mt-4">
          <span className="text-3xl font-bold text-gray-900">{totalReleases.toLocaleString()}</span>
          <span className="text-sm text-gray-600 ml-2">Total Releases</span>
        </div>
      </CardContent>
    </Card>
  )
}
