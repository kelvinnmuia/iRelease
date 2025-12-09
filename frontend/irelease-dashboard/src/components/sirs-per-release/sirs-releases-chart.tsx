import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface SirReleaseData {
  "sir-release-id": number;
  "sir-id": number;
  "release_version": string;
  "iteration": number;
  "changeddate": string;
  "bug_severity": string;
  "priority": string;
  "assigned_to": string;
  "bug_status": string;
  "resolution": string;
  "component": string;
  "op_sys": string;
  "short_desc": string;
  "cf_sirwith": string;
}

interface SirReleaseChartProps {
  sirReleaseData: SirReleaseData[];
  selectedReleaseName: string;
  selectedIterationName: string;
}

const COLORS = ["#ae1f26", "#767276", "#0c0c0c", "#d11314"]

export function SirReleasesChart({ 
  sirReleaseData, 
  selectedReleaseName, 
  selectedIterationName 
}: SirReleaseChartProps) {
  
  // Count SIRs by severity
  const severityCounts = {
    blocker: sirReleaseData.filter(item => item.bug_severity.toLowerCase() === "blocker").length,
    critical: sirReleaseData.filter(item => item.bug_severity.toLowerCase() === "critical").length,
    major: sirReleaseData.filter(item => item.bug_severity.toLowerCase() === "major").length,
    minor: sirReleaseData.filter(item => item.bug_severity.toLowerCase() === "minor").length,
  }

  // Transform data for the chart with actual counts
  const chartData = [
    { name: "Blocker", value: severityCounts.blocker },
    { name: "Critical", value: severityCounts.critical },
    { name: "Major", value: severityCounts.major },
    { name: "Minor", value: severityCounts.minor },
  ].filter(item => item.value > 0); // Only show severities with data

  const totalSIRs = sirReleaseData.length;

  // Calculate percentages for tooltip and legend
  const dataWithPercentages = chartData.map(item => ({
    ...item,
    percentage: totalSIRs > 0 ? ((item.value / totalSIRs) * 100).toFixed(1) : "0.0"
  }));

  // Get screen width for responsive sizing
  const isSmallScreen = typeof window !== "undefined" && window.innerWidth < 640
  
  // Increased inner radius slightly for a more noticeable donut hole
  const innerRadius = isSmallScreen ? 25 : 40  // Increased from 15/25
  const outerRadius = isSmallScreen ? 70 : 95  // Same outer radius

  // Simple centered percentage labels
  const renderCenteredLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    
    // Position label in the middle of the segment (closer to outer edge)
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if segment is large enough
    if (percent < 0.05) return null; // Hide labels for very small segments

    return (
      <text 
        x={x} 
        y={y} 
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
        style={{ 
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))',
          pointerEvents: 'none'
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg lg:text-xl text-center">
          SIRs by Severity
        </CardTitle>
        <CardDescription className="text-center mt-2">
          Release: {selectedReleaseName} • Iteration: {selectedIterationName}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {totalSIRs === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-gray-400 mb-2">
              <svg 
                className="w-16 h-16" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No SIRs data available</p>
            <p className="text-gray-400 text-sm mt-1">
              Select a release and iteration with SIRs data
            </p>
          </div>
        ) : (
          <div className="flex gap-4">
            {/* Chart section with total applications below */}
            <div className="flex flex-col items-center flex-1">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    paddingAngle={1}
                    dataKey="value"
                    label={renderCenteredLabel}
                    labelLine={false}
                    isAnimationActive={true} // Keep animation enabled
                    animationBegin={0}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const { name, value } = payload[0]
                        // find index in data
                        const index = chartData.findIndex((item) => item.name === name)
                        const color = COLORS[index % COLORS.length]
                        const percentage = dataWithPercentages.find(item => item.name === name)?.percentage || "0.0"

                        return (
                          <div
                            style={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              fontSize: "0.875rem",
                              padding: "12px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              minWidth: "150px",
                            }}
                          >
                            <div style={{ color, fontWeight: 600, fontSize: "1rem", marginBottom: "4px" }}>
                              {name}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                              <span style={{ color: "#6b7280" }}>Count:</span>
                              <span style={{ color: "#1f2937", fontWeight: 500 }}>{value}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "#6b7280" }}>Percentage:</span>
                              <span style={{ color, fontWeight: 600, fontSize: "1.1rem" }}>
                                {percentage}%
                              </span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Total SIRs */}
              <div className="flex flex-col items-center mt-4">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {totalSIRs}
                </div>
                <div className="text-xs md:text-sm text-gray-500">
                  Total SIRs
                </div>
              </div>
            </div>

            {/* Divider (hidden on small screens) */}
            <div className="hidden md:block w-px bg-gray-200" />

            {/* Legend section with percentages */}
            <div className="flex-1 space-y-3 self-center-safe">
              {dataWithPercentages.map((item, index) => (
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
                  <div className="text-left flex-shrink-0 lg:mr-70">
                    <div className="text-sm font-semibold text-gray-900">
                      {item.value}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}