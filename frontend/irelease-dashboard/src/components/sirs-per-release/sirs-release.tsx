import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function SirsRelease() {
  // State for filters
  const [selectedRelease, setSelectedRelease] = useState<string>('')
  const [selectedIteration, setSelectedIteration] = useState<string>('')

  // Mock data for dropdowns (replace with actual API data)
  const releaseVersions = [
    { id: '1', name: '3.9.230.1' },
    { id: '2', name: '3.9.231.2' },
    { id: '3', name: '3.9.232.3' }
  ]
  
  const iterations = [
    { id: '1', name: '2' },
    { id: '2', name: '3' },
    { id: '3', name: '4' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Primary Filters on Top Right */}
      <div className="p-4 sm:p-6 pb-6 sm:pb-8">
        <div className="flex justify-end">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Release Version Select */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Release Version
              </label>
              <Select onValueChange={setSelectedRelease} value={selectedRelease}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select Release" />
                </SelectTrigger>
                <SelectContent>
                  {releaseVersions.map((release) => (
                    <SelectItem key={release.id} value={release.id}>
                      {release.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Iteration Select */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Iteration
              </label>
              <Select onValueChange={setSelectedIteration} value={selectedIteration}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Iteration" />
                </SelectTrigger>
                <SelectContent>
                  {iterations.map((iteration) => (
                    <SelectItem key={iteration.id} value={iteration.id}>
                      {iteration.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State - Centered with 40px spacing */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6">
        {/* Slightly transparent white background */}
        <div className="bg-white/70 rounded-xl shadow-sm w-full min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-8 sm:p-10 md:p-12 text-center">
          {/* Icon - Magnifying glass/search representing analysis/exploration */}
          <div className="flex justify-center mb-8 sm:mb-10">
            <div className="rounded-full bg-blue-50 p-5 sm:p-6">
              <svg 
                className="w-12 h-12 sm:w-14 sm:h-14 text-blue-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-4 sm:mb-6">
            Select a Release and Iteration
          </h2>
          
          {/* Description */}
          <div className="mt-4 sm:mt-6 max-w-xl sm:max-w-2xl">
            <p className="text-gray-600 mx-auto text-lg sm:text-xl leading-relaxed">
              Choose a release version and iteration from the dropdowns above to view its SIRs analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}