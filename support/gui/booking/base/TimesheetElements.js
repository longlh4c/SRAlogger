/**
 * Elements and selectors for the Timesheet page.
 */
export const TimesheetElements = {
    // Buttons
    buttonLog: ".text-nowrap.btn-primary",
    buttonAdd: ".btn-add.btn-primary",
    buttonCancel: '[data-dismiss="modal-create-work-log"]',
    buttonSubmit: "button.btn-primary.mr-1",
    timesheetMenuButton: '//*[text()="Timesheet"]',

    // Modals and Headers
    logWorkHeader: "#modal-create-work-log___BV_modal_header_",
    successModal: ".toastification-close-icon",

    // Date Picker
    datePicker: "#startDate",
    monthPicker: ".flatpickr-monthDropdown-months",

    // Logged Time & Work Details
    totalTime: ".modal-body .total-time.ml-2",
    timeLineHours: "#modal-create-work-log___BV_modal_body_ .day-holiday",
    firstRow: "tr.cursor-pointer.hia",

    // Input fields
    projectSelect: '(//input[@class="vs__search"])[1]',
    typeofWorkSelect: '(//input[@class="vs__search"])[2]',
    taskDesc: '[name="description"]',
    hours: '[name="worked"]',

    /**
     * Generates an XPath selector for a specific date in the flatpickr calendar.
     * @param {string} formattedDate - The date formatted as "Month Day, Year" (e.g. "July 19, 2024").
     * @returns {string} The XPath selector string.
     */
    getDatePickerDay(formattedDate) {
        return `//*[contains(@class, "flatpickr-day")][@aria-label="${formattedDate}"]`;
    }
};
