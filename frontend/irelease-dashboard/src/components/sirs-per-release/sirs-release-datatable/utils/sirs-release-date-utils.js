// Improved date utility that handles leading zeros and various formats
// Updated to match date-utils.ts structure while preserving SIRs-specific functionality
/**
 * Parse a date string in various formats to a Date object.
 * Supports ISO with time, "DD MMM YYYY", "MMM DD, YYYY", and ISO date formats.
 * If the date string is invalid, returns null.
 *
 * @param {string} dateStr - the date string to be parsed
 * @returns {Date|null} - the parsed Date object or null if the date string is invalid
 */
export const parseDate = (dateStr) => {
    if (!dateStr)
        return null;
    // Normalize spacing
    const normalizedStr = dateStr.trim().replace(/\s+/g, ' ');
    // ISO with time: "2025-09-25 14:13:37"
    const isoWithTimeMatch = normalizedStr.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (isoWithTimeMatch) {
        const year = parseInt(isoWithTimeMatch[1], 10);
        const month = parseInt(isoWithTimeMatch[2], 10) - 1;
        const day = parseInt(isoWithTimeMatch[3], 10);
        const hours = parseInt(isoWithTimeMatch[4], 10);
        const minutes = parseInt(isoWithTimeMatch[5], 10);
        const seconds = parseInt(isoWithTimeMatch[6], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            return new Date(year, month, day, hours, minutes, seconds);
        }
    }
    // Month mapping (case-insensitive)
    const monthMap = {
        jan: 0, january: 0,
        feb: 1, february: 1,
        mar: 2, march: 2,
        apr: 3, april: 3,
        may: 4,
        jun: 5, june: 5,
        jul: 6, july: 6,
        aug: 7, august: 7,
        sep: 8, september: 8,
        oct: 9, october: 9,
        nov: 10, november: 10,
        dec: 11, december: 11
    };
    const parts = normalizedStr.split(' ');
    // "08 Sep 2025" | "8 Sep 2025" format (matches date-utils.ts)
    if (parts.length === 3 && !parts[1].endsWith(',')) {
        const day = parseInt(parts[0].replace(/^0+/, ''), 10);
        const month = monthMap[parts[1].toLowerCase()];
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            return new Date(year, month, day);
        }
    }
    // "Sep 08, 2025" format
    if (parts.length === 3 && parts[1].endsWith(',')) {
        const month = monthMap[parts[0].toLowerCase()];
        const day = parseInt(parts[1].replace(',', '').replace(/^0+/, ''), 10);
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            return new Date(year, month, day);
        }
    }
    // ISO date: "2025-09-08"
    const isoMatch = normalizedStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        const year = parseInt(isoMatch[1], 10);
        const month = parseInt(isoMatch[2], 10) - 1;
        const day = parseInt(isoMatch[3], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            return new Date(year, month, day);
        }
    }
    // Fallback - try standard Date parsing
    const date = new Date(normalizedStr);
    return isNaN(date.getTime()) ? null : date;
};
/**
 * Format a Date object to "DD MMM YYYY HH:MM" format.
 * This is specific to SIRs releases and includes time.
 *
 * @param {Date} date - the Date object to format
 * @returns {string} - formatted date string
 */
export const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}`;
};
/**
 * Format a Date object to "DD MMM YYYY" format (without time).
 * Matches the formatDate function in date-utils.ts.
 *
 * @param {Date} date - the Date object to format
 * @returns {string} - formatted date string without time
 */
export const formatDateWithoutTime = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};
/**
 * Format an ISO date string to "DD MMM YYYY" format.
 * Matches the formatISODate function in date-utils.ts exactly.
 *
 * @param {string} isoDateStr - ISO date string
 * @returns {string} - formatted date string
 */
export const formatISODate = (isoDateStr) => {
    if (!isoDateStr)
        return '';
    const date = new Date(isoDateStr);
    if (isNaN(date.getTime()))
        return isoDateStr; // Return original if invalid
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};
/**
 * Convert an ISO date string to a readable date format.
 * This is specific to SIRs releases.
 *
 * @param {string} dateStr - ISO date string
 * @returns {string} - readable date string
 */
export const isoToReadableDate = (dateStr) => {
    if (!dateStr)
        return dateStr;
    const isoPattern = /^\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2}:\d{2})?$/;
    if (!isoPattern.test(dateStr.trim())) {
        return dateStr;
    }
    const parsed = parseDate(dateStr);
    if (!parsed)
        return dateStr;
    return formatDateWithoutTime(parsed);
};
/**
 * SIMPLIFIED AND CORRECTED VERSION of dateMatchesSearch
 * Check if a date string matches a search term.
 * This is specific to SIRs releases search functionality.
 *
 * @param {string} dateStr - date string to search in
 * @param {string} searchTerm - search term to match
 * @returns {boolean} - true if date matches search
 */
export const dateMatchesSearch = (dateStr, searchTerm) => {
    if (!dateStr || !searchTerm)
        return false;
    const search = searchTerm.toLowerCase().trim();
    if (!search)
        return false;
    // 1. Direct string match (exact substring in original date string)
    if (dateStr.toLowerCase().includes(search)) {
        return true;
    }
    // 2. Parse the date
    const date = parseDate(dateStr);
    if (!date)
        return false;
    // Get date components
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    // Month names
    const monthShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][monthIndex];
    const monthLong = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ][monthIndex];
    // Create searchable date strings
    const dateStrings = [
        // Most common formats
        `${day} ${monthShort} ${year}`.toLowerCase(), // "20 sep 2025"
        `${day.toString().padStart(2, '0')} ${monthShort} ${year}`.toLowerCase(), // "20 sep 2025" (with leading zero)
        `${monthShort} ${day}, ${year}`.toLowerCase(), // "sep 20, 2025"
        `${monthShort} ${day.toString().padStart(2, '0')}, ${year}`.toLowerCase(), // "sep 20, 2025" (with leading zero)
        // ISO format
        `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`.toLowerCase(), // "2025-09-20"
    ];
    // Check if the search term matches ANY of the date strings
    for (const dateString of dateStrings) {
        if (dateString.includes(search)) {
            return true;
        }
    }
    // Check individual components
    const dayStr = day.toString();
    const dayStrWithZero = day.toString().padStart(2, '0');
    const monthNum = (monthIndex + 1).toString();
    const monthNumWithZero = (monthIndex + 1).toString().padStart(2, '0');
    const yearStr = year.toString();
    const yearShort = (year % 100).toString().padStart(2, '0');
    const components = [
        dayStr, dayStrWithZero,
        monthShort, monthLong,
        monthNum, monthNumWithZero,
        yearStr, yearShort
    ];
    // Check if search matches any individual component exactly
    for (const component of components) {
        if (component.toLowerCase() === search) {
            return true;
        }
    }
    // Handle multi-word searches (e.g., "20 sep", "sep 2025")
    const searchParts = search.split(/\s+/).filter(part => part.length > 0);
    if (searchParts.length > 1) {
        // Check if ALL search parts are found in ANY date string
        for (const dateString of dateStrings) {
            const allPartsFound = searchParts.every(part => dateString.includes(part));
            if (allPartsFound) {
                return true;
            }
        }
    }
    return false;
};
/**
 * Debug helper for testing date search functionality.
 * This is specific to SIRs releases.
 *
 * @param {string} dateStr - date string to test
 * @param {string} searchTerm - search term to test
 * @returns {object} - debug information
 */
export const testDateSearch = (dateStr, searchTerm) => {
    const parsed = parseDate(dateStr);
    // Get date components for debugging
    const day = parsed?.getDate();
    const monthIndex = parsed?.getMonth();
    const monthShort = monthIndex !== undefined ?
        ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][monthIndex] :
        'N/A';
    return {
        dateStr,
        searchTerm,
        parsed: parsed?.toISOString() ?? null,
        formatted: parsed ? formatDate(parsed) : null,
        day,
        monthShort,
        matches: dateMatchesSearch(dateStr, searchTerm),
    };
};
/**
 * Get the latest date from an item with multiple date fields.
 * This function matches the one in date-utils.ts.
 *
 * @param {any} item - item containing date fields
 * @returns {Date|null} - latest date or null if no valid dates
 */
export const getLatestDate = (item) => {
    const dateFields = [
        'deliveredDate', 'tdNoticeDate', 'testDeployDate',
        'testStartDate', 'testEndDate', 'prodDeployDate'
    ];
    const dates = dateFields
        .map(field => parseDate(item[field]))
        .filter(date => date !== null);
    if (dates.length === 0)
        return null;
    return new Date(Math.max(...dates.map(d => d.getTime())));
};
/**
 * Get the earliest date from an item with multiple date fields.
 * This function matches the one in date-utils.ts.
 *
 * @param {any} item - item containing date fields
 * @returns {Date|null} - earliest date or null if no valid dates
 */
export const getEarliestDate = (item) => {
    const dateFields = [
        'deliveredDate', 'tdNoticeDate', 'testDeployDate',
        'testStartDate', 'testEndDate', 'prodDeployDate'
    ];
    const dates = dateFields
        .map(field => parseDate(item[field]))
        .filter(date => date !== null);
    if (dates.length === 0)
        return null;
    return new Date(Math.min(...dates.map(d => d.getTime())));
};
