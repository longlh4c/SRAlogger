import ConfigHelper from '../../support/lib/ConfigHelper';
import Timesheet from '../../support/gui/booking/base/Timesheet';
import DateHelper from '../../support/utils/date';

beforeEach(() => {
    // Prevent Cypress from failing on uncaught exceptions
    cy.on('uncaught:exception', (err, runnable) => false);
});

describe('Log timesheet SRA', () => {
    it('Log from start date to today', { tags: ['@sbx_fr'] }, () => {
        cy.visit(ConfigHelper.getTimesheetURL());
        cy.pause(10000);

        const offset = Cypress.env('noDaysBefore') !== undefined 
            ? parseInt(Cypress.env('noDaysBefore')) 
            : DateHelper.getLastWeekMondayOffset();

        cy.log(`Calculated start day offset: ${offset}`);

        Timesheet.clickTimesheetMenuButton();
        Timesheet.verifyUrl();
        Timesheet.logDate(offset, 'Smartbox Dedicated team', 'Test execution', 'Manual & Auto test', 8);
    });
});
