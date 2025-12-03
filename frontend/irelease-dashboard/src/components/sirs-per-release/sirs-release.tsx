import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

export function SirsRelease() {
  // State for filters
  const [selectedRelease, setSelectedRelease] = useState<string>('')
  const [selectedIteration, setSelectedIteration] = useState<string>('')

  // Mock data for dropdowns (replace with actual API data)
  const releaseVersions = [
    { id: '1', name: 'Release 1.0' },
    { id: '2', name: 'Release 2.0' },
    { id: '3', name: 'Release 3.0' }
  ]
  
  const iterations = [
    { id: '1', name: 'Iteration 1' },
    { id: '2', name: 'Iteration 2' },
    { id: '3', name: 'Iteration 3' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Primary Filters */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Release Version Select */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Release Version
            </label>
            <Select onValueChange={setSelectedRelease} value={selectedRelease}>
              <SelectTrigger className="w-full sm:w-[250px]">
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
              <SelectTrigger className="w-full sm:w-[250px]">
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

      {/* Empty State Placeholder */}
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-2 border-dashed border-gray-300 bg-transparent shadow-none">
          <CardContent className="pt-6 pb-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-gray-100 p-4">
                <svg 
                  className="w-8 h-8 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">
                  No Data to Display
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Select a release version and iteration to view its SIRs analysis.
                </p>
              </div>

              {/* Optional: Show selected values for debugging */}
              {(selectedRelease || selectedIteration) && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <p className="text-xs text-blue-600">
                    {selectedRelease && `Release: ${releaseVersions.find(r => r.id === selectedRelease)?.name}`}
                    {selectedRelease && selectedIteration && ' • '}
                    {selectedIteration && `Iteration: ${iterations.find(i => i.id === selectedIteration)?.name}`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}