import ConfigHelper from '../../support/lib/ConfigHelper';
import Timesheet from '../../support/gui/booking/base/Timesheet';

beforeEach(() => {
    // Prevent Cypress from failing on uncaught exceptions
    cy.on('uncaught:exception', (err, runnable) => false);
});

describe('Log timesheet SRA', () => {
    it('Log from start date to today', { tags: ['@sbx_fr'] }, () => {
        cy.visit(ConfigHelper.getTimesheetURL());
        cy.pause(10000);

        // let startDate = Cypress.env('startDate');

        Timesheet.clickTimesheetMenuButton();
        Timesheet.verifyUrl();
        Timesheet.logDate(-9, 'Smartbox Dedicated team', 'Test execution', 'Manual & Auto test', 8);
    });
});
