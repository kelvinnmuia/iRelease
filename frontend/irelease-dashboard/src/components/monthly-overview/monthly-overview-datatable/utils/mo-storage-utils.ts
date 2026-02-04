import { STORAGE_KEYS } from '../constants/mo-releases-constants';
import { allColumns } from '../constants/mo-releases-constants';

export const loadColumnVisibility = (): Record<string, boolean> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COLUMN_VISIBILITY);
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
    localStorage.setItem(STORAGE_KEYS.COLUMN_VISIBILITY, JSON.stringify(visibility));
  } catch (error) {
    console.warn('Failed to save column visibility to localStorage:', error);
  }
};

export const loadDateRangeFilter = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DATE_RANGE_FILTER);
    return saved || "";
  } catch (error) {
    console.warn('Failed to load date range filter from localStorage:', error);
    return "";
  }
};

export const saveDateRangeFilter = (dateRange: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DATE_RANGE_FILTER, dateRange);
  } catch (error) {
    console.warn('Failed to save date range filter to localStorage:', error);
  }
};

export const loadDateRangeDetails = (): { startDate: string; endDate: string } => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DATE_RANGE_DETAILS);
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
    localStorage.setItem(STORAGE_KEYS.DATE_RANGE_DETAILS, JSON.stringify({ startDate, endDate }));
  } catch (error) {
    console.warn('Failed to save date range details to localStorage:', error);
  }
};

export const clearDateRangeDetails = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.DATE_RANGE_DETAILS);
  } catch (error) {
    console.warn('Failed to clear date range details from localStorage:', error);
  }
};

export const loadItemsPerPage = (): number => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ITEMS_PER_PAGE);
    return saved ? parseInt(saved) : 10;
  } catch (error) {
    console.warn('Failed to load items per page from localStorage:', error);
    return 10;
  }
};

export const saveItemsPerPage = (itemsPerPage: number) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS_PER_PAGE, itemsPerPage.toString());
  } catch (error) {
    console.warn('Failed to save items per page to localStorage:', error);
  }
};