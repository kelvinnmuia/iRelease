import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface Release {
  id: number;
  releaseId: string;
  systemName: string;
  systemId: string;
  releaseVersion: string;
  iteration: string;
  releaseDescription: string;
  functionalityDelivered: string;
  deliveredDate: string;
  tdNoticeDate: string;
  testDeployDate: string;
  testStartDate: string;
  testEndDate: string;
  prodDeployDate: string;
  testStatus: string;
  deploymentStatus: string;
  outstandingIssues: string;
  comments: string;
  releaseType: string; // This is what we'll use for Major, Medium, Minor
  month: string;
  financialYear: string;
}

interface MoReleasesTypeChartProps {
  releasesData: Release[];
}

const COLORS = ["#d11314", "#767276", "#0c0c0c"] // Major, Medium, Minor

export function MoReleasesTypeChart({ releasesData }: MoReleasesTypeChartProps) {
  
  // Helper function to normalize release type
  const normalizeReleaseType = (type: string): string | null => {
    if (!type) return null;
    
    const normalized = type.trim().toLowerCase();
    
    if (normalized.includes('major')) return 'major';
    if (normalized.includes('medium')) return 'medium';
    if (normalized.includes('minor')) return 'minor';
    
    return normalized; // Return as-is if not matching
  }

  // Count releases by type with better normalization
  const allReleases = releasesData || [];
  
  const typeCounts = {
    major: allReleases.filter(item => {
      const normalizedType = normalizeReleaseType(item.releaseType);
      return normalizedType === 'major';
    }).length,
    medium: allReleases.filter(item => {
      const normalizedType = normalizeReleaseType(item.releaseType);
      return normalizedType === 'medium';
    }).length,
    minor: allReleases.filter(item => {
      const normalizedType = normalizeReleaseType(item.releaseType);
      return normalizedType === 'minor';
    }).length,
  }

  // Get count of releases with unrecognized types
  const otherReleases = allReleases.filter(item => {
    const normalizedType = normalizeReleaseType(item.releaseType);
    return normalizedType && !['major', 'medium', 'minor'].includes(normalizedType);
  }).length;

  // Calculate total releases that we're displaying in the chart
  const totalDisplayedReleases = typeCounts.major + typeCounts.medium + typeCounts.minor;
  
  // Calculate actual total releases (including others if we want to show them)
  const totalAllReleases = allReleases.length;

  // Transform data for the chart with actual counts
  const chartData = [
    { name: "Major", value: typeCounts.major },
    { name: "Medium", value: typeCounts.medium },
    { name: "Minor", value: typeCounts.minor },
  ].filter(item => item.value > 0); // Only show types with data

  // Calculate percentages based on displayed releases, not all releases
  const dataWithPercentages = chartData.map(item => ({
    ...item,
    percentage: totalDisplayedReleases > 0 ? ((item.value / totalDisplayedReleases) * 100).toFixed(1) : "0.0"
  }));

  // Get screen width for responsive sizing
  const isSmallScreen = typeof window !== "undefined" && window.innerWidth < 640
  
  // Increased inner radius slightly for a more noticeable donut hole
  const innerRadius = isSmallScreen ? 25 : 40
  const outerRadius = isSmallScreen ? 70 : 95

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
          Releases by Type
        </CardTitle>
        {otherReleases > 0 && (
          <p className="text-xs text-gray-500 text-center mt-1">
            ({otherReleases} releases with other types not shown)
          </p>
        )}
      </CardHeader>

      <CardContent>
        {totalDisplayedReleases === 0 ? (
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
            <p className="text-gray-500 font-medium">No releases data available</p>
            <p className="text-gray-400 text-sm mt-1">
              No Major, Medium, or Minor releases found
            </p>
          </div>
        ) : (
          <div className="flex gap-4">
            {/* Chart section with total releases below */}
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
                    isAnimationActive={true}
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

              {/* Total Displayed Releases */}
              <div className="flex flex-col items-center mt-4">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {totalDisplayedReleases}
                </div>
                <div className="text-xs md:text-sm text-gray-500">
                  Total Releases (Major/Medium/Minor)
                </div>
                {totalAllReleases !== totalDisplayedReleases && (
                  <div className="text-xs text-gray-400 mt-1">
                    of {totalAllReleases} total releases
                  </div>
                )}
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
                  <div className="text-left flex-shrink-0 lg:mr-60">
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