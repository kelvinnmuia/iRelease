import { useEffect, useState, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Search, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Current year's data (2024)
const data = [
  { month: "Jan", Major: 100, Medium: 70, Minor: 30 },
  { month: "Feb", Major: 150, Medium: 120, Minor: 30 },
  { month: "Mar", Major: 200, Medium: 150, Minor: 50 },
  { month: "Apr", Major: 180, Medium: 140, Minor: 40 },
  { month: "May", Major: 220, Medium: 170, Minor: 50 },
  { month: "Jun", Major: 240, Medium: 190, Minor: 50 },
  { month: "Jul", Major: 260, Medium: 200, Minor: 60 },
  { month: "Aug", Major: 300, Medium: 250, Minor: 50 },
  { month: "Sep", Major: 280, Medium: 230, Minor: 50 },
  { month: "Oct", Major: 320, Medium: 270, Minor: 50 },
  { month: "Nov", Major: 350, Medium: 300, Minor: 50 },
  { month: "Dec", Major: 400, Medium: 350, Minor: 50 },
]

export function ReleaseTypeChart() {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate years array similar to your monthly overview
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const yearsArray = []
    
    // Start from 2020 and go up to current year + 1 for future planning
    for (let year = 2020; year <= currentYear + 1; year++) {
      yearsArray.push({
        id: year.toString(),
        name: year.toString()
      })
    }
    
    return yearsArray.sort((a, b) => parseInt(b.id) - parseInt(a.id))
  }, [])

  // Filter years based on search term
  const filteredYears = useMemo(() => {
    if (!searchTerm.trim()) return years
    return years.filter(year =>
      year.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [years, searchTerm])

  // Get selected year name
  const selectedYearItem = years.find(item => item.id === selectedYear)

  // Filter data based on selected year
  // Currently only 2024 has data, other years return empty array
  const getDataForYear = (year: string) => {
    if (year === "2026") {
      return data
    }
    return [] // Empty array for years without data
  }

  const chartData = getDataForYear(selectedYear)
  const hasData = chartData.length > 0

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

  // Original screen resize functionality - PRESERVED
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <CardTitle className="text-lg lg:text-xl text-center md:text-left">
            Release Type by Month
          </CardTitle>
          
          {/* Searchable Dropdown for Year Selection */}
          <div className="relative" ref={containerRef}>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center justify-between bg-white border-gray-300 hover:bg-gray-50 w-full md:w-[160px] h-9"
              onClick={handleTriggerClick}
              type="button"
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
                className="absolute z-50 mt-1 w-[190px] bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
                style={{ top: '100%', right: 0 }}
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
        <ResponsiveContainer width="100%" height={300}>
          {hasData ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                interval={0} // Shows all 12 months
                tick={{ fill: "#6b7280", fontSize: isLargeScreen ? 13 : 11 }}
                angle={isLargeScreen ? 0 : -25} // Tilts labels slightly on small screens
                textAnchor={isLargeScreen ? "middle" : "end"}
                height={isLargeScreen ? 30 : 50} // Adds space for rotated labels
              />
              <YAxis tick={{ fill: "#6b7280", fontSize: 16 }} />
              <Tooltip />
              <Legend
                layout="horizontal"
                verticalAlign="top"
                align="center"
                iconType="circle"
                wrapperStyle={{
                  marginTop: isLargeScreen ? -30 : -10,
                  paddingBottom: 16,
                  fontSize: isLargeScreen ? 14 : 13,
                }}
              />
              <Bar stackId="a" dataKey="Major" fill="#d11314" />
              <Bar stackId="a" dataKey="Medium" fill="#767276" />
              <Bar stackId="a" dataKey="Minor" fill="#0c0c0c" />
            </BarChart>
          ) : (
            <div className="flex items-center justify-center h-full">
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
                  No data available for {selectedYear}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Select a different year to view release type analysis
                </p>
              </div>
            </div>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}