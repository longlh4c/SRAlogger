
import commonPage from './CommonPage';

const ELEMENT = {
    buttonLog: '.text-nowrap.btn-primary',
    buttonAdd: '.btn-add.btn-primary',
    buttonCancel: '[data-dismiss="modal-create-work-log"]',
    timesheetButton: '//*[text()="Timesheet"]',
    logWorkHeader: '#modal-create-work-log___BV_modal_header_',
    datePicker: '#startDate',
    monthPicker: '.flatpickr-monthDropdown-months',
    totalTime: '.modal-body .total-time.ml-2',
    firstRow: 'tr.cursor-pointer.hia',
    projectSelect: '(//input[@class="vs__search"])[1]',
    typeofWorkSelect: '(//input[@class="vs__search"])[2]',
    taskDesc: '[name="description"]',
    hours: '[name="worked"]',
    buttonSubmt: 'button.btn-primary.mr-1'
};

class Timesheet extends commonPage {
    verifyUrl() {
        cy.step('Check on Timesheet page');
        cy.url().should('contain', 'time-sheet');
    }

    checkLogworkModalDisplayed() {
        cy.get(ELEMENT.logWorkHeader).should('be.visible');
    }

    clickTimesheetMenuButton() {
        cy.step('Click Timesheet menu button');
        cy.xpath(ELEMENT.timesheetButton).first().click();
    }

    clickLogButton() {
        cy.step('Click Log button');
        cy.get(ELEMENT.buttonLog).first().click();
    }

    logDate(startDateS, project, typeOfWork, desc, hours) {
        let startDate = new Date(startDateS);
        for (let i = 0; i < 5; i++) {
            //July 23, 2024
            this.clickLogButton();
            this.checkLogworkModalDisplayed();

            let month = startDateS.toString().split(' ')[0];

            cy.get(ELEMENT.datePicker).click();
            cy.get(ELEMENT.monthPicker).select(month, { force: true });
            cy.wait(1000);
            let selectDate = '//*[contains(@class, "flatpickr-day")][not(contains(@class, "flatpickr-disabled"))][@aria-label="' + startDateS + '"]'

            cy.xpath(selectDate).click();
            cy.wait(1000);

            //check if not logged
            cy.get(ELEMENT.totalTime).last().invoke('text').then(totalTime => {
                cy.log('Logged time: ' + totalTime);
                if (parseInt(totalTime) === 0) {
                    cy.log('Now logging');
                    cy.get(ELEMENT.buttonAdd).click();
                    cy.get(ELEMENT.firstRow).should('be.visible');
                    cy.xpath(ELEMENT.projectSelect).type(project).type('{enter}');
                    cy.xpath(ELEMENT.typeofWorkSelect).type(typeOfWork).type('{enter}');
                    cy.get(ELEMENT.taskDesc).type(desc);
                    cy.get(ELEMENT.hours).type(hours);
                    cy.get(ELEMENT.buttonSubmt).click();
                    cy.wait(1000);
                }
                else {
                    cy.get(ELEMENT.buttonCancel).click();
                }
            });
            startDate = new Date(this.addDays(startDate, 1));

            let weekend = startDate.toString().split(' ')[0];
            if (weekend === 'Sat') startDate = new Date(this.addDays(startDate, 2));
            if (weekend === 'Sun') startDate = new Date(this.addDays(startDate, 1));

            startDateS = this.formatDate(startDate);
        }
    }

    addDays(date, quantity) {
        const result = new Date(date);
        result.setDate(result.getDate() + quantity);
        cy.log('new date: ' + result);
        return result;
    }

    formatDate(dateToFormat) {
        //startDate: Fri Jul 19 2024
        let month = dateToFormat.toString().split(' ')[1];
        let day = dateToFormat.toString().split(' ')[2];
        let year = dateToFormat.toString().split(' ')[3];

        if (month === 'Jan') month = 'January';
        if (month === 'Feb') month = 'February';
        if (month === 'Mar') month = 'March';
        if (month === 'Apr') month = 'April';
        if (month === 'May') month = 'May';
        if (month === 'Jun') month = 'June';
        if (month === 'Jul') month = 'July';
        if (month === 'Aug') month = 'August';
        if (month === 'Sep') month = 'September';
        if (month === 'Oct') month = 'October';
        if (month === 'Nov') month = 'November';
        if (month === 'Dec') month = 'December';

        if (day.substring(0, 1) === '0') day = day.substring(1);

        let result = month + ' ' + day + ', ' + year;
        cy.log('new date: ' + result);
        return result;
    }
}

export default new Timesheet();
