/**
 * Parse a date string in the format "DD MMM YYYY" to a Date object.
 * If the date string is invalid, returns null.
 *
 * @param {string} dateStr - the date string to be parsed
 * @returns {Date|null} - the parsed Date object or null if the date string is invalid
 */
export declare const parseDate: (dateStr: string) => Date | null;
/**
 * Format a Date object to "DD MMM YYYY" string format.
 *
 * @param {Date} date - the Date object to format
 * @returns {string} - the formatted date string
 */
export declare const formatDate: (date: Date) => string;
/**
 * Format an ISO date string to "DD MMM YYYY" string format.
 * If the ISO date string is invalid, returns the original string.
 * If the input is empty, returns an empty string.
 *
 * @param {string} isoDateStr - the ISO date string to format
 * @returns {string} - the formatted date string or the original if invalid
 */
export declare const formatISODate: (isoDateStr: string) => string;
/**
 * Get the latest date from an item's date fields.
 * Checks multiple date fields and returns the most recent one.
 *
 * @param {any} item - the item containing date fields
 * @returns {Date|null} - the latest Date object or null if no valid dates found
 */
export declare const getLatestDate: (item: any) => Date | null;
/**
 * Get the earliest date from an item's date fields.
 * Checks multiple date fields and returns the oldest one.
 *
 * @param {any} item - the item containing date fields
 * @returns {Date|null} - the earliest Date object or null if no valid dates found
 */
export declare const getEarliestDate: (item: any) => Date | null;
