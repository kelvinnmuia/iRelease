// sir-release-header.tsx

interface SirReleaseHeaderProps {
  globalFilter: string;
  selectedRelease: string;
  selectedIteration: string;
}

export const SirReleaseHeader = ({
  globalFilter,
  selectedRelease,
  selectedIteration
}: SirReleaseHeaderProps) => {
  return (
    <div className="bg-gray-50 p-6">
      <div className="items-start">
        <h1 className="text-2xl font-semibold text-gray-900">SIRs Per Release</h1>
      </div>
    </div>
  );
};