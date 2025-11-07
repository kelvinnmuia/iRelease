import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Blocker", value: 300 },
  { name: "Critical", value: 200 },
  { name: "Major", value: 250 },
  { name: "Minor", value: 260 },
]

const COLORS = ["#ae1f26", "#767276", "#0c0c0c", "#d11314"]

export function SirsTypeChart() {
  const totalApplications = data.reduce((sum, item) => sum + item.value, 0)

  // Get screen width (no layout change — just used to adjust chart size)
  const isSmallScreen = typeof window !== "undefined" && window.innerWidth < 640
  const innerRadius = isSmallScreen ? 35 : 50
  const outerRadius = isSmallScreen ? 60 : 80

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg lg:text-xl text-center">
          SIRs by Severity
        </CardTitle>
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
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={2}
                  dataKey="value"
                  label={false}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const { name, value } = payload[0]
                      // find index in data
                      const index = data.findIndex((item) => item.name === name)
                      const color = COLORS[index % COLORS.length]

                      return (
                        <div
                          style={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            fontSize: "0.875rem",
                            padding: "8px 12px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                            minWidth: "130px",
                          }}
                        >
                          <div style={{ color, fontWeight: 600 }}>{name}</div>
                          <div style={{ color: "#1f2937" }}>{value}</div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Total applications */}
            <div className="flex flex-col items-center mt-2">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {totalApplications}
              </div>
              <div className="text-xs md:text-sm text-gray-500">
                Total SIRs
              </div>
            </div>
          </div>

          {/* Divider (hidden on small screens) */}
          <div className="hidden md:block w-px bg-gray-200" />

          {/* Legend section */}
          <div className="flex-1 space-y-3 self-center-safe">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: COLORS[index % COLORS.length],
                    }}
                  >
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 ml-auto">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
