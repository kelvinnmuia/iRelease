import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DateRangePickerProps {
  dateRange: string;
  startDate: string;
  endDate: string;
  showDatePicker: boolean;
  onShowDatePickerChange: (show: boolean) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApply: () => void;
  onClear: () => void;
  datePickerRef: React.RefObject<HTMLDivElement>;
}

export const DateRangePicker = ({
  dateRange,
  startDate,
  endDate,
  showDatePicker,
  onShowDatePickerChange,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onClear,
  datePickerRef
}: DateRangePickerProps) => {

  const handleApply = () => {
    onApply(); // Call the apply function
    onShowDatePickerChange(false); // Close the picker
  };

  const handleClear = () => {
    onClear(); // Call the clear function
    onShowDatePickerChange(false); // Close the picker
  };

  return (
    <div className="relative flex-1 md:flex-none md:w-56 lg:w-64" ref={datePickerRef}>
      <div
        className="flex items-center cursor-pointer"
        onClick={() => onShowDatePickerChange(!showDatePicker)}
      >
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        <Input
          placeholder="Date range"
          value={dateRange}
          readOnly
          className="w-full pl-10 pr-4 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 cursor-pointer focus:ring-2 focus:ring-offset-0 focus:outline-none text-sm min-w-0 truncate"
          title={dateRange}
        />
      </div>

      {showDatePicker && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-72">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleApply}
                disabled={!startDate || !endDate}
                className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50"
                variant="outline"
                size="sm"
              >
                Apply
              </Button>
              <Button
                onClick={handleClear}
                className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500"
                size="sm"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};