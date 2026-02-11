/**
 * Parse a date string in the format "DD MMM YYYY" to a Date object.
 * If the date string is invalid, returns null.
 *
 * @param {string} dateStr - the date string to be parsed
 * @returns {Date|null} - the parsed Date object or null if the date string is invalid
 */
export declare const parseDate: (dateStr: string) => Date | null;
export declare const formatDate: (date: Date) => string;
export declare const formatISODate: (isoDateStr: string) => string;
export declare const getLatestDate: (item: any) => Date | null;
export declare const getEarliestDate: (item: any) => Date | null;
