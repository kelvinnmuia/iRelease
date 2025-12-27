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
    <div className="bg-gray-50 p-6">
      {/* Selected rows info */}
      {selectedRowsCount > 0 && (
        <div className="-mt-2 mb-4 text-sm text-gray-600">
          {selectedRowsCount} of {totalFilteredCount} row(s) selected
        </div>
      )}

      {/* Filter status */}
      {(globalFilter || dateRange) && (
        <div className="-mt-2 mb-4 text-sm text-gray-500">
          Showing {totalFilteredCount} releases
          {globalFilter && ` matching "${globalFilter}"`}
          {dateRange && ` within date range: ${dateRange}`}
        </div>
      )}
    </div>
  );
};