import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Search, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ireleaseDB, dexieEvents, SirsReleaseRecord } from "@/db/ireleasedb"

const COLORS = ["#ae1f26", "#767276", "#0c0c0c", "#d11314", "#7f151b", "#4f4c4f", "#050505", "#9a0d0e"]

interface SirsData {
  name: string
  value: number
}

interface ReleaseOption {
  id: string
  name: string
}

interface IterationOption {
  id: string
  name: string
}

export function SirsTypeChart() {
  const [selectedRelease, setSelectedRelease] = useState<string>("")
  const [selectedIteration, setSelectedIteration] = useState<string>("")
  const [releaseSearchTerm, setReleaseSearchTerm] = useState("")
  const [iterationSearchTerm, setIterationSearchTerm] = useState("")
  const [isReleaseOpen, setIsReleaseOpen] = useState(false)
  const [isIterationOpen, setIsIterationOpen] = useState(false)
  const [sirsData, setSirsData] = useState<SirsData[]>([])
  const [loading, setLoading] = useState(false)
  const [releases, setReleases] = useState<ReleaseOption[]>([])
  const [iterations, setIterations] = useState<IterationOption[]>([])
  const releaseSearchInputRef = useRef<HTMLInputElement>(null)
  const iterationSearchInputRef = useRef<HTMLInputElement>(null)
  const releaseContainerRef = useRef<HTMLDivElement>(null)
  const iterationContainerRef = useRef<HTMLDivElement>(null)

  // Fetch available releases
  const fetchReleases = useCallback(async () => {
    try {
      const allSirs = await ireleaseDB.sirsReleases.toArray()
      
      const uniqueReleases = [...new Set(allSirs
        .map(sir => sir.Release_version)
        .filter(Boolean)
      )].sort((a, b) => b.localeCompare(a))

      const releaseOptions = uniqueReleases.map(release => ({
        id: release,
        name: release
      }))

      setReleases(releaseOptions)
      console.log(`📊 Loaded ${releaseOptions.length} releases from Dexie`)
    } catch (error) {
      console.error("Error fetching releases:", error)
      setReleases([])
    }
  }, [])

  // Fetch iterations for selected release - ASCENDING ORDER
  const fetchIterations = useCallback(async () => {
    if (!selectedRelease) {
      setIterations([])
      return
    }

    try {
      const allSirs = await ireleaseDB.sirsReleases
        .where('Release_version')
        .equals(selectedRelease)
        .toArray()

      const uniqueIterations = [...new Set(allSirs
        .map(sir => sir.Iteration)
        .filter(Boolean)
      )].sort((a, b) => {
        // Sort numerically if both are numbers
        const aNum = parseInt(a)
        const bNum = parseInt(b)
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum
        }
        // Otherwise sort as strings
        return a.localeCompare(b)
      })

      const iterationOptions = uniqueIterations.map(iteration => ({
        id: iteration,
        name: iteration
      }))

      setIterations(iterationOptions)
      console.log(`📊 Loaded ${iterationOptions.length} iterations for release ${selectedRelease}`)
    } catch (error) {
      console.error("Error fetching iterations:", error)
      setIterations([])
    }
  }, [selectedRelease])

  // Fetch SIRs data for selected release and iteration - SIMPLIFIED VERSION
  const fetchSirsData = useCallback(async () => {
    try {
      setLoading(true)
      
      if (!selectedRelease || !selectedIteration) {
        setSirsData([])
        return
      }

      console.log(`🔍 Looking for SIRs: Release="${selectedRelease}", Iteration="${selectedIteration}"`)
      
      // Get all SIRs and filter manually (no compound index needed)
      const allSirs = await ireleaseDB.sirsReleases.toArray()
      
      // Manual filtering - exact match first
      let filteredSirs = allSirs.filter(sir => 
        sir.Release_version === selectedRelease && 
        sir.Iteration === selectedIteration
      )
      
      // If empty, try case-insensitive matching
      if (filteredSirs.length === 0) {
        console.log('🔍 Trying case-insensitive matching...')
        filteredSirs = allSirs.filter(sir => 
          sir.Release_version?.toLowerCase() === selectedRelease.toLowerCase() && 
          sir.Iteration?.toLowerCase() === selectedIteration.toLowerCase()
        )
      }
      
      console.log(`📊 Total found: ${filteredSirs.length} SIRs`)
      
      // Show sample data for debugging
      if (filteredSirs.length > 0) {
        console.log('📝 Sample SIRs found:', filteredSirs.slice(0, 3).map(s => ({
          Sir_Rel_Id: s.Sir_Rel_Id,
          Bug_severity: s.Bug_severity,
          Priority: s.Priority
        })))
      }

      // Count SIRs by severity
      const severityCounts: Record<string, number> = {}
      
      filteredSirs.forEach((sir: SirsReleaseRecord) => {
        // Use Bug_severity or Priority if Bug_severity is empty
        const severity = sir.Bug_severity || sir.Priority || 'Unknown'
        severityCounts[severity] = (severityCounts[severity] || 0) + 1
      })

      console.log('📈 Severity distribution:', severityCounts)
      
      // Convert to chart data
      const chartData = Object.entries(severityCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

      console.log('📊 Chart data ready:', chartData)
      setSirsData(chartData)
      
    } catch (error) {
      console.error("❌ Error fetching SIRs data:", error)
      setSirsData([])
    } finally {
      setLoading(false)
    }
  }, [selectedRelease, selectedIteration])

  // Initial data fetch
  useEffect(() => {
    fetchReleases()
  }, [fetchReleases])

  // Fetch iterations when release changes
  useEffect(() => {
    fetchIterations()
    setSelectedIteration("")
    setIterationSearchTerm("")
  }, [selectedRelease, fetchIterations])

  // Fetch SIRs data when selection changes
  useEffect(() => {
    if (selectedRelease && selectedIteration) {
      fetchSirsData()
    } else {
      setSirsData([])
    }
  }, [selectedRelease, selectedIteration, fetchSirsData])

  // Listen for data updates
  useEffect(() => {
    const handleDataUpdated = () => {
      fetchReleases()
      if (selectedRelease) {
        fetchIterations()
        if (selectedIteration) {
          fetchSirsData()
        }
      }
    }

    dexieEvents.on('data-updated', handleDataUpdated)
    dexieEvents.on('sync-completed', handleDataUpdated)

    return () => {
      dexieEvents.off('data-updated', handleDataUpdated)
      dexieEvents.off('sync-completed', handleDataUpdated)
    }
  }, [fetchReleases, fetchIterations, fetchSirsData, selectedRelease, selectedIteration])

  // Filter releases based on search term
  const filteredReleases = useMemo(() => {
    if (!releaseSearchTerm.trim()) return releases
    return releases.filter(release =>
      release.name.toLowerCase().includes(releaseSearchTerm.toLowerCase())
    )
  }, [releases, releaseSearchTerm])

  // Filter iterations based on search term
  const filteredIterations = useMemo(() => {
    if (!iterationSearchTerm.trim()) return iterations
    return iterations.filter(iteration =>
      iteration.name.toLowerCase().includes(iterationSearchTerm.toLowerCase())
    )
  }, [iterations, iterationSearchTerm])

  const totalSirs = sirsData.reduce((sum, item) => sum + item.value, 0)

  // Get selected release and iteration names
  const selectedReleaseItem = releases.find(item => item.id === selectedRelease)
  const selectedIterationItem = iterations.find(item => item.id === selectedIteration)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (releaseContainerRef.current && !releaseContainerRef.current.contains(event.target as Node)) {
        setIsReleaseOpen(false)
        setReleaseSearchTerm("")
      }
      if (iterationContainerRef.current && !iterationContainerRef.current.contains(event.target as Node)) {
        setIsIterationOpen(false)
        setIterationSearchTerm("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isReleaseOpen && releaseSearchInputRef.current) {
      setTimeout(() => {
        releaseSearchInputRef.current?.focus()
      }, 100)
      setReleaseSearchTerm("")
    }
  }, [isReleaseOpen])

  useEffect(() => {
    if (isIterationOpen && iterationSearchInputRef.current) {
      setTimeout(() => {
        iterationSearchInputRef.current?.focus()
      }, 100)
      setIterationSearchTerm("")
    }
  }, [isIterationOpen])

  const handleReleaseSelect = (releaseId: string) => {
    setSelectedRelease(releaseId)
    setIsReleaseOpen(false)
    setReleaseSearchTerm("")
  }

  const handleIterationSelect = (iterationId: string) => {
    setSelectedIteration(iterationId)
    setIsIterationOpen(false)
    setIterationSearchTerm("")
  }

  const handleClearReleaseSearch = (e: React.MouseEvent) => {
    e.stopPropagation()
    setReleaseSearchTerm("")
    setTimeout(() => {
      releaseSearchInputRef.current?.focus()
    }, 0)
  }

  const handleClearIterationSearch = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIterationSearchTerm("")
    setTimeout(() => {
      iterationSearchInputRef.current?.focus()
    }, 0)
  }

  const handleClearReleaseSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedRelease("")
    setSelectedIteration("")
    setIsReleaseOpen(false)
    setReleaseSearchTerm("")
    setSirsData([])
  }

  const handleClearIterationSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIteration("")
    setIsIterationOpen(false)
    setIterationSearchTerm("")
    setSirsData([])
  }

  const handleReleaseKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsReleaseOpen(false)
      setReleaseSearchTerm("")
    }
  }

  const handleIterationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsIterationOpen(false)
      setIterationSearchTerm("")
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        {/* Title and Description on top */}
        <div className="text-center mb-4">
          <CardTitle className="text-lg lg:text-xl">
            SIRs by Severity
          </CardTitle>
          <CardDescription className="mt-2">
            {selectedRelease && selectedIteration 
              ? `SIRs for Release ${selectedRelease} • Iteration ${selectedIteration}`
              : "Select a release and iteration to view SIRs"}
          </CardDescription>
        </div>

        {/* Dropdowns below the title/description */}
        <div className="flex justify-center gap-2">
          {/* Release Dropdown */}
          <div className="relative" ref={releaseContainerRef}>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center justify-between bg-white border-gray-300 hover:bg-gray-50 w-[160px] h-9"
              onClick={() => setIsReleaseOpen(!isReleaseOpen)}
              type="button"
            >
              <span className="truncate flex-1 text-left">
                {selectedReleaseItem?.name || "Select Release"}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                {selectedRelease && (
                  <X
                    className="w-3 h-3 text-gray-400 hover:text-gray-600"
                    onClick={handleClearReleaseSelection}
                  />
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isReleaseOpen ? 'rotate-180' : ''}`} />
              </div>
            </Button>

            {isReleaseOpen && (
              <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
                style={{ width: '190px', top: '100%', left: 0 }}>
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      ref={releaseSearchInputRef}
                      placeholder="Search releases..."
                      value={releaseSearchTerm}
                      onChange={(e) => setReleaseSearchTerm(e.target.value)}
                      onKeyDown={handleReleaseKeyDown}
                      className="w-full pl-9 pr-8 h-8 text-sm border-red-400 focus:border-red-500 focus:ring-red-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {releaseSearchTerm && (
                      <X
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                        onClick={handleClearReleaseSearch}
                      />
                    )}
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto">
                  {filteredReleases.length > 0 ? (
                    filteredReleases.map((release) => (
                      <button
                        key={release.id}
                        onClick={() => handleReleaseSelect(release.id)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer ${selectedRelease === release.id
                            ? "bg-red-50 text-red-600 font-medium"
                            : "text-gray-700"
                          }`}
                        type="button"
                      >
                        <span className="truncate block">{release.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                      {releases.length === 0 ? "No releases found" : "No matching releases"}
                    </div>
                  )}
                </div>

                {releaseSearchTerm && filteredReleases.length > 0 && (
                  <div className="px-3 py-2 border-t text-xs text-gray-500 bg-gray-50">
                    {filteredReleases.length} of {releases.length} releases
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Iteration Dropdown */}
          <div className="relative" ref={iterationContainerRef}>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center justify-between bg-white border-gray-300 hover:bg-gray-50 w-[160px] h-9"
              onClick={() => selectedRelease && setIsIterationOpen(!isIterationOpen)}
              type="button"
              disabled={!selectedRelease}
            >
              <span className="truncate flex-1 text-left">
                {selectedIterationItem?.name || "Select Iteration"}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                {selectedIteration && (
                  <X
                    className="w-3 h-3 text-gray-400 hover:text-gray-600"
                    onClick={handleClearIterationSelection}
                  />
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isIterationOpen ? 'rotate-180' : ''}`} />
              </div>
            </Button>

            {isIterationOpen && (
              <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
                style={{ width: '190px', top: '100%', left: 0 }}>
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      ref={iterationSearchInputRef}
                      placeholder="Search iterations..."
                      value={iterationSearchTerm}
                      onChange={(e) => setIterationSearchTerm(e.target.value)}
                      onKeyDown={handleIterationKeyDown}
                      className="w-full pl-9 pr-8 h-8 text-sm border-red-400 focus:border-red-500 focus:ring-red-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {iterationSearchTerm && (
                      <X
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                        onClick={handleClearIterationSearch}
                      />
                    )}
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto">
                  {filteredIterations.length > 0 ? (
                    filteredIterations.map((iteration) => (
                      <button
                        key={iteration.id}
                        onClick={() => handleIterationSelect(iteration.id)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer ${selectedIteration === iteration.id
                            ? "bg-red-50 text-red-600 font-medium"
                            : "text-gray-700"
                          }`}
                        type="button"
                      >
                        <span className="truncate block">{iteration.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                      {iterations.length === 0 ? "No iterations found" : "No matching iterations"}
                    </div>
                  )}
                </div>

                {iterationSearchTerm && filteredIterations.length > 0 && (
                  <div className="px-3 py-2 border-t text-xs text-gray-500 bg-gray-50">
                    {filteredIterations.length} of {iterations.length} iterations
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!selectedRelease || !selectedIteration ? (
          <div className="flex flex-col items-center justify-center h-[200px]">
            <div className="text-center p-4">
              <p className="text-gray-500 font-medium">Select a release and iteration to view SIRs</p>
              <p className="text-gray-400 text-sm mt-1">Choose from the dropdowns above</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex gap-4 animate-pulse">
            <div className="flex flex-col items-center flex-1">
              <div className="w-full h-[200px] bg-gray-200 rounded"></div>
              <div className="flex flex-col items-center mt-2">
                <div className="h-8 w-16 bg-gray-200 rounded mt-2"></div>
                <div className="h-4 w-20 bg-gray-200 rounded mt-1"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="flex flex-col items-center flex-1">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sirsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={false}
                  >
                    {sirsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const { name, value } = payload[0]
                        const index = sirsData.findIndex((item) => item.name === name)
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

              <div className="flex flex-col items-center mt-2">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {totalSirs}
                </div>
                <div className="text-xs md:text-sm text-gray-500">
                  Total SIRs
                </div>
              </div>
            </div>

            <div className="hidden md:block w-px bg-gray-200" />

            <div className="flex-1 space-y-3 self-center-safe">
              {sirsData.length > 0 ? (
                sirsData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm font-medium"
                        style={{ color: COLORS[index % COLORS.length] }}>
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 ml-auto">
                      {item.value}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
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
                      No severity data available
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Fetch data using the 'Fetch Data' button
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}