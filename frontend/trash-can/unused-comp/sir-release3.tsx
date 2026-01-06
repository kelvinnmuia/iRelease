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
                <div className="bg-white/60 rounded-xl shadow-sm w-full min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-8 sm:p-10 md:p-12 text-center">
                    {/* Empty Folder Icon with bottom shadow - Enlarged 1.5x */}
                    <div className="flex justify-center mb-5 sm:mb-6 relative">
                        {/* Light gray shadow at the bottom of SVG - Enlarged */}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1.5 sm:w-24 sm:h-2 bg-gray-300/70 blur-sm rounded-full"></div>
                        
                        {/* Empty Folder SVG - Enlarged 1.5x */}
                        <svg 
                            className="w-25 h-25 sm:w-30 sm:h-30 text-gray-400 relative z-10" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={1.5} 
                                d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" 
                            />
                        </svg>
                    </div>

                    {/* Title - Reduced spacing */}
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-2">
                        No SIRs Analysis Data
                    </h2>

                    {/* Description - Reduced spacing */}
                    <div className="mt-2 sm:mt-2 max-w-lg sm:max-w-xl">
                        <p className="text-gray-600 mx-auto text-sm sm:text-base leading-relaxed">
                            Please select a release version and iteration to view its SIRs analysis.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}