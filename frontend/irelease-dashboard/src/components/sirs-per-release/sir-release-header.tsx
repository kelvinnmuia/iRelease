// sir-release-header.tsx

interface SirReleaseHeaderProps {
  selectedRowsCount: number;
  totalFilteredCount: number;
  globalFilter: string;
  selectedRelease: string;
  selectedIteration: string;
}

export const SirReleaseHeader = ({
  selectedRowsCount,
  totalFilteredCount,
  globalFilter,
  selectedRelease,
  selectedIteration
}: SirReleaseHeaderProps) => {
  return (
    <div className="bg-gray-50 p-6">
      <div className="items-start">
        <h1 className="text-2xl font-semibold text-gray-900">SIRs Per Release</h1>
      </div>


     
      {/* Default message when no filters applied */}
      {!globalFilter && !selectedRelease && !selectedIteration && (
        <div className="mt-2 text-sm text-gray-500">
          Showing all {totalFilteredCount} SIR(s). Use filters to narrow down results.
        </div>
      )}
    </div>
  );
};