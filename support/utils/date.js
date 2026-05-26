export default {
    /**
     * Adds a specified number of days to a date.
     * @param {Date|string} date - The starting date.
     * @param {number} quantity - Number of days to add.
     * @returns {Date} The resulting Date object.
     */
    addDays(date, quantity) {
        const result = new Date(date);
        result.setDate(result.getDate() + quantity);
        cy.log("new date: " + result);
        return result;
    },

    /**
     * Formats a date into "Month Day, Year" format (e.g., "July 19, 2024").
     * @param {Date|string} dateToFormat - The date to format.
     * @returns {string} The formatted date string.
     */
    formatDate(dateToFormat) {
        const d = new Date(dateToFormat);
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const monthName = months[d.getMonth()];
        const day = d.getDate();
        const year = d.getFullYear();
        const result = `${monthName} ${day}, ${year}`;
        cy.log("new date: " + result);
        return result;
    },

    /**
     * Checks if a date falls on a weekend (Saturday or Sunday).
     * @param {Date|string} date - The date to check.
     * @returns {boolean} True if the date is a Saturday or Sunday, false otherwise.
     */
    isWeekend(date) {
        const d = new Date(date);
        const day = d.getDay(); // 0 = Sunday, 6 = Saturday
        return day === 0 || day === 6;
    },

    /**
     * Gets the next weekday if the date falls on a weekend.
     * Moves Saturday to Monday (+2 days), Sunday to Monday (+1 day).
     * @param {Date|string} date - The date to check and adjust.
     * @returns {Date} The next weekday Date object.
     */
    getNextWeekday(date) {
        const d = new Date(date);
        const day = d.getDay();
        if (day === 6) { // Saturday -> Monday
            return this.addDays(d, 2);
        } else if (day === 0) { // Sunday -> Monday
            return this.addDays(d, 1);
        }
        return d;
    },

    /**
     * Gets the offset (in days) from today to Monday of last week.
     * @returns {number} The offset in days (negative number).
     */
    getLastWeekMondayOffset() {
        const today = new Date();
        const day = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysToSubtract = day === 0 ? 13 : day + 6;
        return -daysToSubtract;
    }
};