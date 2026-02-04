import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useEffect, useState } from "react"
import { getReleasesData, processForSystem, SystemData } from "@/api/releases" // Changed import

const COLORS = ["#ae1f26", "#767276", "#0c0c0c", "#d11314", "#5a5a5a", "#b6484f"]

export function ReleasesBySystemName() {
  const [data, setData] = useState<SystemData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // CHANGED: Use new pattern - fetch once, process locally
        const releases = await getReleasesData() // Changed this line
        const systemData = processForSystem(releases) // Changed this line
        setData(systemData)
      } catch (error) {
        console.error("Error fetching releases by system:", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalReleases = data.reduce((sum, item) => sum + item.value, 0)

  // Get screen width (no layout change — just used to adjust chart size)
  const isSmallScreen = typeof window !== "undefined" && window.innerWidth < 640
  const innerRadius = isSmallScreen ? 35 : 50
  const outerRadius = isSmallScreen ? 60 : 80

  // Loading skeleton
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg lg:text-xl text-center">
            Releases by System Name
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 animate-pulse">
            <div className="flex flex-col items-center flex-1">
              <div className="w-full h-[200px] bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex flex-col items-center mt-2">
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
              </div>
            </div>
            <div className="hidden md:block w-px bg-gray-200" />
            <div className="flex-1 space-y-3 self-center-safe">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No data state
  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg lg:text-xl text-center">
            Releases by System Name
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg lg:text-xl text-center">
          Releases by System Name
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex gap-4">
          {/* Chart section with total releases by system name below */}
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

            {/* Total Releases */}
            <div className="flex flex-col items-center mt-2">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {totalReleases}
              </div>
              <div className="text-xs md:text-sm text-gray-500">
                Total Releases
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