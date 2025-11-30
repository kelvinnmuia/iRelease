import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseDate, formatDate } from "./utils/date-utils";

interface DatePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const DatePickerInput = ({
  value,
  onChange,
  placeholder = "Select date"
}: DatePickerInputProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
        setTempDate("");
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const handleApply = () => {
    if (tempDate) {
      const parsedDate = parseDate(tempDate);
      if (parsedDate) {
        const formattedDate = formatDate(parsedDate);
        onChange(formattedDate);
      }
    }
    setShowPicker(false);
    setTempDate("");
  };

  const handleClear = () => {
    onChange('');
    setShowPicker(false);
    setTempDate("");
  };

  const handleDateInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTempDate(e.target.value);
  };

  return (
    <div className="relative w-full" ref={pickerRef}>
      <div
        className="flex items-center cursor-pointer"
        onClick={() => {
          setShowPicker(!showPicker);
          setTempDate("");
        }}
      >
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        <Input
          placeholder={placeholder}
          value={value}
          readOnly
          className="w-full pl-10 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 cursor-pointer sm:pr-4 focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none"
        />
      </div>

      {showPicker && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-64">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <div className="w-full">
                <Input
                  type="date"
                  value={tempDate}
                  onChange={handleDateInputChange}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleApply}
                disabled={!tempDate}
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