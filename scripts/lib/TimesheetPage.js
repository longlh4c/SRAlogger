const { MONTHS, formatDate } = require('./dateUtils');

// Every selector/role used to interact with the SRA time-sheet page,
// grouped here so the methods below only deal with interaction logic.
const LOCATORS = {
  logTimeButton: { role: 'button', name: 'Log Time', exact: true },
  dialog: '[role="dialog"]',
  cancelButton: { role: 'button', name: 'Cancel' },

  startDateInput: '#startDate',
  monthDropdown: '.flatpickr-monthDropdown-months',
  yearInput: '.numInput.cur-year, .flatpickr-current-month input[type="number"]',
  dayCell: (label) => `.flatpickr-day[aria-label="${label}"]`,

  addRowButton: '.btn.btn-add',
  lastRow: 'tbody tr',
  vueSearchInput: 'input.vs__search',
  descriptionInput: 'input, textarea',
  hoursInput: 'input',
};

/**
 * Page object for the SRA time-sheet "Log Time" dialog.
 */
class TimesheetPage {
  constructor(page, config) {
    this.page = page;
    this.config = config;
  }

  get logTimeButton() {
    const { role, name, exact } = LOCATORS.logTimeButton;
    return this.page.getByRole(role, { name, exact }).first();
  }

  get openDialog() {
    return this.page.locator(LOCATORS.dialog).last();
  }

  async gotoTimesheet() {
    await this.page.goto(this.config.timesheet.url);
  }

  async ensureLoggedIn() {
    await this.gotoTimesheet();
    if (!this.page.url().includes('/time-sheet')) {
      console.log('Chua dang nhap - vui long dang nhap thu cong trong cua so trinh duyet dang mo...');
      await this.page.waitForURL('**/time-sheet**', { timeout: 0 });
    }
    await this.page.waitForSelector('button:has-text("Log Time")');
  }

  async openLogDialogFor(target) {
    await this.logTimeButton.click();
    const dialog = this.openDialog;
    await dialog.waitFor({ state: 'visible' });
    return dialog;
  }

  async selectCalendarDay(dialog, target) {
    await dialog.locator(LOCATORS.startDateInput).click();

    const monthDropdown = this.page.locator(LOCATORS.monthDropdown);
    await monthDropdown.selectOption({ label: MONTHS[target.getMonth()] });

    const yearInput = this.page.locator(LOCATORS.yearInput);
    if (await yearInput.count()) {
      const currentYear = await yearInput.inputValue();
      if (parseInt(currentYear, 10) !== target.getFullYear()) {
        await yearInput.fill(String(target.getFullYear()));
        await yearInput.press('Enter');
      }
    }

    return this.page.locator(LOCATORS.dayCell(formatDate(target)));
  }

  async selectVueOption(cell, searchText, optionNameMatch) {
    const input = cell.locator(LOCATORS.vueSearchInput);
    await input.click();
    await input.fill(searchText);
    const option = this.page.getByRole('option', { name: optionNameMatch }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
  }

  async cancelDialog(dialog) {
    const { role, name } = LOCATORS.cancelButton;
    await dialog.getByRole(role, { name }).click();
  }

  async readHoursInfo(dialog) {
    const dialogText = await dialog.innerText();
    const allocatedMatch = dialogText.match(/Allocated \(hrs\)\s*([\d.]+)/);
    const workLogMatch = dialogText.match(/Work Log \(hrs\)\s*([\d.]+)/);
    return {
      allocatedHrs: allocatedMatch ? parseFloat(allocatedMatch[1]) : NaN,
      workLogHrs: workLogMatch ? parseFloat(workLogMatch[1]) : NaN,
    };
  }

  async fillAndSubmitLogWork(dialog) {
    const { logEntry } = this.config;

    await dialog.locator(LOCATORS.addRowButton).click();
    const row = dialog.locator(LOCATORS.lastRow).last();
    const cells = row.locator('td');

    await this.selectVueOption(cells.nth(2), logEntry.projectSearch, logEntry.projectOptionName);
    await this.selectVueOption(cells.nth(3), logEntry.typeOfWorkSearch, logEntry.typeOfWorkOptionName);
    await cells.nth(4).locator(LOCATORS.descriptionInput).first().fill(logEntry.description);

    // The hours field shows a "8.00" placeholder that is NOT a real committed
    // value — submitting without re-typing it trips "Field is required".
    const hoursInput = cells.nth(5).locator(LOCATORS.hoursInput);
    await hoursInput.click();
    await hoursInput.fill(logEntry.hours);

    const { role, name, exact } = LOCATORS.logTimeButton;
    await dialog.getByRole(role, { name, exact }).last().click();
    await dialog.waitFor({ state: 'detached', timeout: 10000 }).catch(() => {});
  }
}

module.exports = TimesheetPage;
