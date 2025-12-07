import React from 'react'

export function MonthlyOverview() {
    return (
        <div>
            {/* Empty View - Centered */}
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6">
                {/* Slightly transparent white background */}
                <div className="bg-white/60 rounded-xl shadow-sm w-full min-h-[calc(100vh-150px)] flex flex-col items-center justify-center p-8 sm:p-10 md:p-12 text-center">
                    {/* Clock Icon with bottom shadow - Enlarged 1.5x */}
                    <div className="flex justify-center mb-5 sm:mb-6 relative">
                        {/* Light gray shadow at the bottom of SVG - Enlarged */}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1.5 sm:w-24 sm:h-2 bg-gray-300/70 blur-sm rounded-full"></div>

                        {/* Clock SVG - Enlarged 1.5x */}
                        <svg
                            className="w-24 h-24 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                            <path
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                d="M12 7v5l3 2"
                            />
                        </svg>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-2">
                        Monthly Overview - Coming Soon
                    </h2>

                    {/* Description */}
                    <div className="mt-2 sm:mt-2 max-w-lg sm:max-w-xl">
                        <p className="text-gray-600 mx-auto text-sm sm:text-base leading-relaxed">
                            The monthly overview page will be available in a future release.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
