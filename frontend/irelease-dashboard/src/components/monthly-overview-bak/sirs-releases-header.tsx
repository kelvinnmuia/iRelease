interface SirReleaseHeaderProps {
  selectedRowsCount: number;
  totalFilteredCount: number;
  globalFilter: string;
}

export const SirReleaseHeader = ({
  selectedRowsCount,
  totalFilteredCount,
  globalFilter
}: SirReleaseHeaderProps) => {
  return (
    <div className="bg-gray-50 p-6">
      <div className="items-start">
        <h1 className="text-2xl font-semibold text-gray-900">Monthly Overview</h1>
      </div>

      {/* Selected rows info */}
      {selectedRowsCount > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          {selectedRowsCount} of {totalFilteredCount} row(s) selected
        </div>
      )}

      {/* Search results - Only show when searching */}
      {globalFilter && (
        <div className="mt-2 text-sm text-gray-500">
          Showing {totalFilteredCount} SIR(s) matching "{globalFilter}"
        </div>
      )}
    </div>
  );
};