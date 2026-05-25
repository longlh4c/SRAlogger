import CommonPage from "./CommonPage";
import { TimesheetElements } from "./TimesheetElements";
import DateHelper from "../../../utils/date";

class Timesheet extends CommonPage {
  /**
   * Verifies the browser is currently on the Timesheet page.
   */
  verifyUrl() {
    cy.step("Check on Timesheet page");
    cy.url().should("contain", "time-sheet");
  }

  /**
   * Verifies the Log Work modal/popup is displayed.
   */
  checkLogworkModalDisplayed() {
    cy.get(TimesheetElements.logWorkHeader).should("be.visible");
  }

  /**
   * Clicks the Timesheet navigation button in the menu.
   */
  clickTimesheetMenuButton() {
    cy.step("Click Timesheet menu button");
    cy.xpath(TimesheetElements.timesheetMenuButton).first().click();
  }

  /**
   * Clicks the Log Work button.
   */
  clickLogButton() {
    cy.step("Click Log button");
    cy.get(TimesheetElements.buttonLog).first().click();
  }

  /**
   * Opens the calendar date picker, selects the specified month, and returns
   * the Cypress chainable for the target day element.
   * @param {string} formattedDate - The target date formatted (e.g. "July 19, 2024").
   * @returns {Cypress.Chainable} Cypress element chainable for the date element.
   */
  selectDate(formattedDate) {
    const month = formattedDate.split(" ")[0];
    cy.get(TimesheetElements.datePicker).click();
    cy.get(TimesheetElements.monthPicker).select(month, { force: true });
    cy.wait(1000);
    
    const dateSelector = TimesheetElements.getDatePickerDay(formattedDate);
    return cy.xpath(dateSelector);
  }

  /**
   * Closes the Log Work modal by clicking the Cancel button.
   */
  cancelLogWork() {
    cy.get(TimesheetElements.buttonCancel).click();
  }

  /**
   * Fills in the log work form with details and submits it.
   * @param {string} project - The project name.
   * @param {string} typeOfWork - The type of work name.
   * @param {string} desc - Description of the task.
   * @param {number|string} hours - Hours spent on the task.
   */
  fillAndSubmitLogWork(project, typeOfWork, desc, hours) {
    cy.log("Now logging");
    cy.get(TimesheetElements.buttonAdd).click();
    cy.get(TimesheetElements.firstRow).should("be.visible");
    
    cy.xpath(TimesheetElements.projectSelect)
      .type(project)
      .type("{enter}");
    cy.xpath(TimesheetElements.typeofWorkSelect)
      .type(typeOfWork)
      .type("{enter}");
      
    cy.get(TimesheetElements.taskDesc).type(desc);
    cy.get(TimesheetElements.hours).type(hours);
    
    cy.get(TimesheetElements.buttonSubmit).click();
    cy.get(TimesheetElements.successModal).should("not.be.visible");
    cy.wait(1000);
  }

  /**
   * Automated logic to log timesheet entries for 5 consecutive days starting from a offset.
   * Filters out weekends, holidays, disabled days in the picker, and already-logged entries.
   * @param {number} noDaysBefore - Days offset from today to start logging.
   * @param {string} project - Project name.
   * @param {string} typeOfWork - Type of work name.
   * @param {string} desc - Detailed description.
   * @param {number|string} hours - Hours to log.
   */
  logDate(noDaysBefore, project, typeOfWork, desc, hours) {
    let unformattedStartDate = DateHelper.addDays(new Date(), noDaysBefore);
    let startDate = DateHelper.formatDate(unformattedStartDate);

    for (let i = 0; i < 5; i++) {
      this.clickLogButton();
      this.checkLogworkModalDisplayed();

      // Automatically skip weekends and jump to the next weekday
      if (DateHelper.isWeekend(unformattedStartDate)) {
        unformattedStartDate = DateHelper.getNextWeekday(unformattedStartDate);
        startDate = DateHelper.formatDate(unformattedStartDate);
      }

      this.selectDate(startDate).then(($el) => {
        // Skip disabled dates in calendar UI
        if ($el.hasClass("flatpickr-disabled")) {
          cy.log(`Date: "${startDate}" is disabled. Skipping click action.`);
          this.cancelLogWork();
        } else {
          cy.wrap($el).click();
          cy.wait(1000);

          // Check if it's a holiday in the UI timeline
          cy.get(TimesheetElements.timeLineHours).then(($holiday) => {
            if ($holiday.length === 2) {
              cy.log(`Date: "${startDate}" is holiday. Skipping log work action.`);
              this.cancelLogWork();
            } else {
              // Retrieve total logged hours for this day to avoid double-logging
              cy.get(TimesheetElements.totalTime)
                .last()
                .invoke("text")
                .then((totalTime) => {
                  cy.log("Logged time: " + totalTime);
                  if (parseInt(totalTime) === 0) {
                    this.fillAndSubmitLogWork(project, typeOfWork, desc, hours);
                  } else {
                    this.cancelLogWork();
                  }
                });
            }
          });
        }
      });

      // Move to the next day
      unformattedStartDate = DateHelper.addDays(unformattedStartDate, 1);
      startDate = DateHelper.formatDate(unformattedStartDate);
    }
  }
}

export default new Timesheet();
