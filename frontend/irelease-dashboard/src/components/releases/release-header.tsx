interface ReleasesHeaderProps {
  selectedRowsCount: number;
  totalFilteredCount: number;
  globalFilter: string;
  dateRange: string;
}

export const ReleasesHeader = ({
  selectedRowsCount,
  totalFilteredCount,
  globalFilter,
  dateRange
}: ReleasesHeaderProps) => {
  return (
    <div className="bg-gray-50 border-b border-gray-200 p-6">
      <div className="items-start mb-7">
        <h1 className="text-2xl font-semibold text-gray-900">All Releases</h1>
      </div>

      {/* Selected rows info */}
      {selectedRowsCount > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          {selectedRowsCount} of {totalFilteredCount} row(s) selected
        </div>
      )}

      {/* Filter status */}
      {(globalFilter || dateRange) && (
        <div className="mt-2 text-sm text-gray-500">
          Showing {totalFilteredCount} releases
          {globalFilter && ` matching "${globalFilter}"`}
          {dateRange && ` within date range: ${dateRange}`}
        </div>
      )}
    </div>
  );
};