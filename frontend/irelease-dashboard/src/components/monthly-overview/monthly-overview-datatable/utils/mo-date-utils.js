/**
 * Parse a date string in the format "DD MMM YYYY" to a Date object.
 * If the date string is invalid, returns null.
 *
 * @param {string} dateStr - the date string to be parsed
 * @returns {Date|null} - the parsed Date object or null if the date string is invalid
 */
export const parseDate = (dateStr) => {
    if (!dateStr)
        return null;
    const months = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    const parts = dateStr.split(' ');
    if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = months[parts[1]];
        const year = parseInt(parts[2]);
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            return new Date(year, month, day);
        }
    }
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
};
/**
 * Format a Date object to "DD MMM YYYY" string format.
 *
 * @param {Date} date - the Date object to format
 * @returns {string} - the formatted date string
 */
export const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};
/**
 * Format an ISO date string to "DD MMM YYYY" string format.
 * If the ISO date string is invalid, returns the original string.
 * If the input is empty, returns an empty string.
 *
 * @param {string} isoDateStr - the ISO date string to format
 * @returns {string} - the formatted date string or the original if invalid
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
 * Get the latest date from an item's date fields.
 * Checks multiple date fields and returns the most recent one.
 *
 * @param {any} item - the item containing date fields
 * @returns {Date|null} - the latest Date object or null if no valid dates found
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
 * Get the earliest date from an item's date fields.
 * Checks multiple date fields and returns the oldest one.
 *
 * @param {any} item - the item containing date fields
 * @returns {Date|null} - the earliest Date object or null if no valid dates found
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
