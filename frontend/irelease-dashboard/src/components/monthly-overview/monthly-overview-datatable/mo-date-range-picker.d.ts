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
export declare const DateRangePicker: ({ dateRange, startDate, endDate, showDatePicker, onShowDatePickerChange, onStartDateChange, onEndDateChange, onApply, onClear, datePickerRef }: DateRangePickerProps) => import("react/jsx-runtime").JSX.Element;
export {};
