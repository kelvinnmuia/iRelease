import React from 'react';

interface SirReleaseHeaderProps {
  selectedRowsCount: number;
  totalFilteredCount: number;
  globalFilter: string;
  dateRange?: string; // Add this line
}

export function SirReleaseHeader({
  selectedRowsCount,
  totalFilteredCount,
  globalFilter,
  dateRange = '' // Add default value
}: SirReleaseHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-semibold text-gray-900">SIRs Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and analyze Software Issue Reports for releases
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="text-sm text-gray-600">
            {selectedRowsCount > 0 && (
              <span className="font-medium">
                {selectedRowsCount} of {totalFilteredCount} row(s) selected
              </span>
            )}
            {selectedRowsCount === 0 && (
              <span>Found {totalFilteredCount} record(s)</span>
            )}
          </div>
          
          {(globalFilter || dateRange) && (
            <div className="text-sm text-gray-500">
              {globalFilter && (
                <span>Search: "{globalFilter}"</span>
              )}
              {globalFilter && dateRange && <span> • </span>}
              {dateRange && (
                <span>Date range: {dateRange}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}