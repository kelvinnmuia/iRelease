import { useState, useMemo, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Search, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSIRsData, processForSIRsTypes, getAvailableYears, SIRsItem } from "@/api/sirs"

const COLORS = ["#ae1f26", "#767276", "#0c0c0c", "#d11314", "#7f151b", "#4f4c4f", "#050505", "#9a0d0e"]

export function SirsTypeChart() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSmallScreen, setIsSmallScreen] = useState(typeof window !== "undefined" && window.innerWidth < 640)

  // State for API data
  const [rawSIRsData, setRawSIRsData] = useState<SIRsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [availableYears, setAvailableYears] = useState<string[]>([])

  // Fetch SIRs data on component mount
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching SIRs data...");
      const sirsData = await getSIRsData();
      console.log(`✅ Successfully loaded ${sirsData.length} SIRs records`);
      
      setRawSIRsData(sirsData);

      // Extract available years from the data
      const years = getAvailableYears(sirsData);
      setAvailableYears(years);
      console.log("📅 Available years:", years);

      // Select year logic
      if (years.length > 0) {
        const currentYear = new Date().getFullYear().toString();
        if (years.includes(currentYear)) {
          setSelectedYear(currentYear);
        } else {
          setSelectedYear(years[0]);
        }
      } else {
        // If no years, show message
        console.warn("⚠️ No years found in data");
      }
    } catch (error) {
      console.error("❌ Error in fetchData:", error);
      // Don't clear data - keep mock data if that's what was returned
      if (rawSIRsData.length === 0) {
        // Only show error if we have no data at all
        setAvailableYears([]);
      }
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  // Generate years array dynamically from available years
  const years = useMemo(() => {
    // If we have data years, use those
    if (availableYears.length > 0) {
      return availableYears
        .map(year => ({
          id: year,
          name: year
        }))
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
    }

    // Otherwise, generate default years (2015-2027)
    const yearsArray = []
    for (let year = 2015; year <= 2027; year++) {
      yearsArray.push({
        id: year.toString(),
        name: year.toString()
      })
    }

    return yearsArray.sort((a, b) => parseInt(b.id) - parseInt(a.id))
  }, [availableYears])

  // Filter years based on search term
  const filteredYears = useMemo(() => {
    if (!searchTerm.trim()) return years
    return years.filter(year =>
      year.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [years, searchTerm])

  // Get selected year name
  const selectedYearItem = years.find(item => item.id === selectedYear)

  // Get data for selected year by processing raw data
  const chartData = useMemo(() => {
    if (loading || rawSIRsData.length === 0) return []
    return processForSIRsTypes(rawSIRsData, selectedYear)
  }, [rawSIRsData, selectedYear, loading])

  const hasData = chartData.length > 0
  const totalApplications = hasData ? chartData.reduce((sum, item) => sum + item.value, 0) : 0

  // Get screen width for chart sizing
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const innerRadius = isSmallScreen ? 35 : 50
  const outerRadius = isSmallScreen ? 60 : 80

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
      setSearchTerm("") // Reset search when opening
    }
  }, [isOpen])

  const handleYearSelect = (yearId: string) => {
    setSelectedYear(yearId)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleClearSearch = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSearchTerm("")
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 0)
  }

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedYear(new Date().getFullYear().toString())
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleTriggerClick = () => {
    setIsOpen(!isOpen)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchTerm("")
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 animate-pulse">
            <div>
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
            </div>
            <div className="h-9 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
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
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg lg:text-xl">
              SIRs by Severity
            </CardTitle>
            <CardDescription className="mt-2">
              SIRs Breakdown by Severity {rawSIRsData.length > 0 ? `(${rawSIRsData.length} total records)` : ''}
            </CardDescription>
          </div>

          {/* Searchable Dropdown for Year Selection */}
          <div className="relative flex-shrink-0" ref={containerRef}>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center justify-between bg-white border-gray-300 hover:bg-gray-50 w-[160px] h-9"
              onClick={handleTriggerClick}
              type="button"
              disabled={rawSIRsData.length === 0}
            >
              <span className="truncate flex-1 text-left">
                {selectedYearItem?.name || "Select year"}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                {selectedYear && selectedYear !== new Date().getFullYear().toString() && (
                  <X
                    className="w-3 h-3 text-gray-400 hover:text-gray-600"
                    onClick={handleClearSelection}
                  />
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </Button>

            {/* Custom Dropdown Content */}
            {isOpen && (
              <div
                className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
                style={{
                  width: '190px',
                  top: '100%',
                  right: 0
                }}
              >
                {/* Search Input */}
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search years..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full pl-9 pr-8 h-8 text-sm border-gray-300 focus:border-red-400 focus:ring-red-400 focus:ring-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {searchTerm && (
                      <X
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                        onClick={handleClearSearch}
                      />
                    )}
                  </div>
                </div>

                {/* Filtered Years List */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredYears.length > 0 ? (
                    filteredYears.map((year) => (
                      <button
                        key={year.id}
                        onClick={() => handleYearSelect(year.id)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors ${selectedYear === year.id
                          ? "bg-red-50 text-red-600 font-medium"
                          : "text-gray-700"
                          }`}
                        type="button"
                      >
                        <span className="truncate block">{year.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                      No years found
                    </div>
                  )}
                </div>

                {/* Show count if years are filtered */}
                {searchTerm && filteredYears.length > 0 && (
                  <div className="px-3 py-2 border-t text-xs text-gray-500 bg-gray-50">
                    {filteredYears.length} of {years.length} years
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {hasData ? (
          <div className="flex gap-4">
            {/* Chart section with total applications below */}
            <div className="flex flex-col items-center flex-1">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    paddingAngle={2}
                    dataKey="value"
                    label={false}
                  >
                    {chartData.map((entry, index) => (
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
                        const index = chartData.findIndex((item) => item.name === name)
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
                            <div style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "4px" }}>
                              {((Number(value) / totalApplications) * 100).toFixed(1)}% of total
                            </div>
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
                  Total SIRs in {selectedYear}
                </div>
              </div>
            </div>

            {/* Divider (hidden on small screens) */}
            <div className="hidden md:block w-px bg-gray-200" />

            {/* Legend section */}
            <div className="flex-1 space-y-3 self-center-safe">
              {chartData.map((item, index) => (
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {item.value}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({((item.value / totalApplications) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : rawSIRsData.length === 0 ? (
          // No data at all (API empty or failed)
          <div className="flex flex-col items-center justify-center h-[200px]">
            <div className="text-center p-4">
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.801 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.801 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                No SIRs data available
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Unable to fetch SIRs data from the server
              </p>
            </div>
          </div>
        ) : (
          // Data exists but not for selected year
          <div className="flex flex-col items-center justify-center h-[200px]">
            <div className="text-center p-4">
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.801 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.801 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                No SIRs data available for {selectedYear}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Select a different year to view SIRs type analysis
              </p>
              <div className="mt-3 text-xs text-gray-500">
                <p>Available years: {availableYears.join(", ")}</p>
                <p>Total records: {rawSIRsData.length}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}