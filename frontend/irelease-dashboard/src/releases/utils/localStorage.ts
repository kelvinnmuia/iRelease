// Import from constants instead of using allColumns directly
import { COLUMN_VISIBILITY_KEY, DATE_RANGE_FILTER_KEY, DATE_RANGE_DETAILS_KEY, ITEMS_PER_PAGE_KEY } from '../constants';

// We'll accept allColumns as a parameter to avoid circular dependencies
export const loadColumnVisibility = (allColumns: any[]): Record<string, boolean> => {
  try {
    const saved = localStorage.getItem(COLUMN_VISIBILITY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const validatedVisibility: Record<string, boolean> = {};
      allColumns.forEach(col => {
        validatedVisibility[col.key] = parsed[col.key] !== undefined ? parsed[col.key] : true;
      });
      return validatedVisibility;
    }
  } catch (error) {
    console.warn('Failed to load column visibility from localStorage:', error);
  }
  return allColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {});
};

export const saveColumnVisibility = (visibility: Record<string, boolean>) => {
  try {
    localStorage.setItem(COLUMN_VISIBILITY_KEY, JSON.stringify(visibility));
  } catch (error) {
    console.warn('Failed to save column visibility to localStorage:', error);
  }
};

export const loadDateRangeFilter = (): string => {
  try {
    const saved = localStorage.getItem(DATE_RANGE_FILTER_KEY);
    return saved || "";
  } catch (error) {
    console.warn('Failed to load date range filter from localStorage:', error);
    return "";
  }
};

export const saveDateRangeFilter = (dateRange: string) => {
  try {
    localStorage.setItem(DATE_RANGE_FILTER_KEY, dateRange);
  } catch (error) {
    console.warn('Failed to save date range filter to localStorage:', error);
  }
};

export const loadDateRangeDetails = (): { startDate: string; endDate: string } => {
  try {
    const saved = localStorage.getItem(DATE_RANGE_DETAILS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to load date range details from localStorage:', error);
  }
  return { startDate: "", endDate: "" };
};

export const saveDateRangeDetails = (startDate: string, endDate: string) => {
  try {
    localStorage.setItem(DATE_RANGE_DETAILS_KEY, JSON.stringify({ startDate, endDate }));
  } catch (error) {
    console.warn('Failed to save date range details to localStorage:', error);
  }
};

export const clearDateRangeDetails = () => {
  try {
    localStorage.removeItem(DATE_RANGE_DETAILS_KEY);
  } catch (error) {
    console.warn('Failed to clear date range details from localStorage:', error);
  }
};

export const loadItemsPerPage = (): number => {
  try {
    const saved = localStorage.getItem(ITEMS_PER_PAGE_KEY);
    return saved ? parseInt(saved) : 10;
  } catch (error) {
    console.warn('Failed to load items per page from localStorage:', error);
    return 10;
  }
};

export const saveItemsPerPage = (itemsPerPage: number) => {
  try {
    localStorage.setItem(ITEMS_PER_PAGE_KEY, itemsPerPage.toString());
  } catch (error) {
    console.warn('Failed to save items per page to localStorage:', error);
  }
};