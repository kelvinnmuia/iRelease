/**
 * Parse a date string in various formats to a Date object.
 * Supports ISO with time, "DD MMM YYYY", "MMM DD, YYYY", and ISO date formats.
 * If the date string is invalid, returns null.
 *
 * @param {string} dateStr - the date string to be parsed
 * @returns {Date|null} - the parsed Date object or null if the date string is invalid
 */
export declare const parseDate: (dateStr: string) => Date | null;
/**
 * Format a Date object to "DD MMM YYYY HH:MM" format.
 * This is specific to SIRs releases and includes time.
 *
 * @param {Date} date - the Date object to format
 * @returns {string} - formatted date string
 */
export declare const formatDate: (date: Date) => string;
/**
 * Format a Date object to "DD MMM YYYY" format (without time).
 * Matches the formatDate function in date-utils.ts.
 *
 * @param {Date} date - the Date object to format
 * @returns {string} - formatted date string without time
 */
export declare const formatDateWithoutTime: (date: Date) => string;
/**
 * Format an ISO date string to "DD MMM YYYY" format.
 * Matches the formatISODate function in date-utils.ts exactly.
 *
 * @param {string} isoDateStr - ISO date string
 * @returns {string} - formatted date string
 */
export declare const formatISODate: (isoDateStr: string) => string;
/**
 * Convert an ISO date string to a readable date format.
 * This is specific to SIRs releases.
 *
 * @param {string} dateStr - ISO date string
 * @returns {string} - readable date string
 */
export declare const isoToReadableDate: (dateStr: string) => string;
/**
 * SIMPLIFIED AND CORRECTED VERSION of dateMatchesSearch
 * Check if a date string matches a search term.
 * This is specific to SIRs releases search functionality.
 *
 * @param {string} dateStr - date string to search in
 * @param {string} searchTerm - search term to match
 * @returns {boolean} - true if date matches search
 */
export declare const dateMatchesSearch: (dateStr: string, searchTerm: string) => boolean;
/**
 * Debug helper for testing date search functionality.
 * This is specific to SIRs releases.
 *
 * @param {string} dateStr - date string to test
 * @param {string} searchTerm - search term to test
 * @returns {object} - debug information
 */
export declare const testDateSearch: (dateStr: string, searchTerm: string) => {
    dateStr: string;
    searchTerm: string;
    parsed: string | null;
    formatted: string | null;
    day: number | undefined;
    monthShort: string;
    matches: boolean;
};
/**
 * Get the latest date from an item with multiple date fields.
 * This function matches the one in date-utils.ts.
 *
 * @param {any} item - item containing date fields
 * @returns {Date|null} - latest date or null if no valid dates
 */
export declare const getLatestDate: (item: any) => Date | null;
/**
 * Get the earliest date from an item with multiple date fields.
 * This function matches the one in date-utils.ts.
 *
 * @param {any} item - item containing date fields
 * @returns {Date|null} - earliest date or null if no valid dates
 */
export declare const getEarliestDate: (item: any) => Date | null;
