/**
 * Standalone Playwright script that logs SRA timesheet for 5 consecutive
 * working days, reusing the same persistent Chromium profile as the
 * `playwright` MCP server (see .mcp.json) so an already-authenticated
 * SSO session is picked up automatically and no login step is needed.
 *
 * IMPORTANT: Chromium locks its profile directory (SingletonLock). Do not
 * run this script while the `playwright` MCP server is connected and using
 * the same --user-data-dir, or launch will fail. Close/disconnect the MCP
 * session first.
 *
 * Usage:
 *   node scripts/sra-logger.js [offsetDays]
 *
 *   offsetDays: days relative to today to start logging (negative = past).
 *   Defaults to "Monday of last week" (same default as e2e/integration/SRALogger.js).
 *
 * Run with plain `node`, not `npx`/`npm run` — this repo pins a "node"
 * devDependency (package.json) whose node_modules/.bin/node shim shadows
 * the real Node when invoked through npm/npx, which breaks Playwright.
 */

const { chromium } = require('playwright');

const PROFILE_DIR = '/home/longlh/snap/chromium/common/chromium-mcp';
const CHROMIUM_PATH = '/snap/bin/chromium';
const TIMESHEET_URL = 'https://sra.smartosc.com/time-sheet';

const PROJECT_SEARCH = 'Smartbox Dedicated team';
const PROJECT_OPTION_NAME = 'Smartbox Dedicated Team';
const TYPE_OF_WORK_SEARCH = 'Test execution';
const TYPE_OF_WORK_OPTION_NAME = 'Test execution';
const DESCRIPTION = 'Manual & Auto test';
const HOURS = '8';
const DAYS_TO_LOG = 5;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function addDays(date, quantity) {
  const result = new Date(date);
  result.setDate(result.getDate() + quantity);
  return result;
}

function formatDate(date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function getNextWeekday(date) {
  const day = date.getDay();
  if (day === 6) return addDays(date, 2); // Saturday -> Monday
  if (day === 0) return addDays(date, 1); // Sunday -> Monday
  return date;
}

function getLastWeekMondayOffset() {
  const today = new Date();
  const day = today.getDay();
  const daysToSubtract = day === 0 ? 13 : day + 6;
  return -daysToSubtract;
}

async function ensureLoggedIn(page) {
  await page.goto(TIMESHEET_URL);
  if (!page.url().includes('/time-sheet')) {
    console.log('Chua dang nhap - vui long dang nhap thu cong trong cua so trinh duyet dang mo...');
    await page.waitForURL('**/time-sheet**', { timeout: 0 });
  }
  await page.waitForSelector('button:has-text("Log Time")');
}

async function openCalendarOnDate(page, dialog, target) {
  await dialog.locator('#startDate').click();

  const monthDropdown = page.locator('.flatpickr-monthDropdown-months');
  await monthDropdown.selectOption({ label: MONTHS[target.getMonth()] });

  const yearInput = page.locator('.numInput.cur-year, .flatpickr-current-month input[type="number"]');
  if (await yearInput.count()) {
    const currentYear = await yearInput.inputValue();
    if (parseInt(currentYear, 10) !== target.getFullYear()) {
      await yearInput.fill(String(target.getFullYear()));
      await yearInput.press('Enter');
    }
  }

  return page.locator(`.flatpickr-day[aria-label="${formatDate(target)}"]`);
}

async function selectVueOption(page, cell, searchText, optionNameMatch) {
  const input = cell.locator('input.vs__search');
  await input.click();
  await input.fill(searchText);
  const option = page.getByRole('option', { name: optionNameMatch }).first();
  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.click();
}

async function fillAndSubmitLogWork(page, dialog) {
  await dialog.locator('.btn.btn-add').click();
  const row = dialog.locator('tbody tr').last();
  const cells = row.locator('td');

  await selectVueOption(page, cells.nth(2), PROJECT_SEARCH, PROJECT_OPTION_NAME);
  await selectVueOption(page, cells.nth(3), TYPE_OF_WORK_SEARCH, TYPE_OF_WORK_OPTION_NAME);

  await cells.nth(4).locator('input, textarea').first().fill(DESCRIPTION);

  // The hours field shows a "8.00" placeholder that is NOT a real committed
  // value — submitting without re-typing it trips "Field is required".
  const hoursInput = cells.nth(5).locator('input');
  await hoursInput.click();
  await hoursInput.fill(HOURS);

  await dialog.getByRole('button', { name: 'Log Time', exact: true }).last().click();
  await dialog.waitFor({ state: 'detached', timeout: 10000 }).catch(() => {});
}

async function processDate(page, target) {
  const dateKey = target.toISOString().slice(0, 10);
  const label = formatDate(target);

  await page.getByRole('button', { name: 'Log Time', exact: true }).first().click();
  const dialog = page.locator('[role="dialog"]').last();
  await dialog.waitFor({ state: 'visible' });

  const dayCell = await openCalendarOnDate(page, dialog, target);

  const isDisabled = await dayCell
    .evaluate((el) => el.classList.contains('flatpickr-disabled'))
    .catch(() => true);

  if (isDisabled) {
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    return { dateKey, label, status: 'skipped', reason: 'ngay bi disable tren lich' };
  }

  await dayCell.click();
  await page.waitForTimeout(1000); // let the hours-info block refresh, mirrors original cy.wait(1000)

  const dialogText = await dialog.innerText();
  const allocatedMatch = dialogText.match(/Allocated \(hrs\)\s*([\d.]+)/);
  const workLogMatch = dialogText.match(/Work Log \(hrs\)\s*([\d.]+)/);
  const allocatedHrs = allocatedMatch ? parseFloat(allocatedMatch[1]) : NaN;
  const workLogHrs = workLogMatch ? parseFloat(workLogMatch[1]) : NaN;

  if (allocatedHrs === 0) {
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    return { dateKey, label, status: 'skipped', reason: 'ngay le / khong co allocated hours' };
  }

  if (workLogHrs !== 0) {
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    return { dateKey, label, status: 'skipped', reason: `da log roi (${workLogHrs}h)` };
  }

  await fillAndSubmitLogWork(page, dialog);
  return { dateKey, label, status: 'logged', reason: `${HOURS}h` };
}

async function main() {
  const offsetArg = process.argv[2];
  const offset = offsetArg !== undefined ? parseInt(offsetArg, 10) : getLastWeekMondayOffset();

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROMIUM_PATH,
  });

  const page = context.pages()[0] ?? (await context.newPage());

  try {
    await ensureLoggedIn(page);

    let current = addDays(new Date(), offset);
    const results = [];

    for (let i = 0; i < DAYS_TO_LOG; i += 1) {
      if (isWeekend(current)) {
        current = getNextWeekday(current);
      }

      try {
        const result = await processDate(page, current);
        results.push(result);
        console.log(`[${result.status}] ${result.dateKey}: ${result.reason}`);
      } catch (err) {
        results.push({ dateKey: current.toISOString().slice(0, 10), status: 'error', reason: err.message });
        console.error(`[error] ${current.toISOString().slice(0, 10)}: ${err.message}`);
      }

      current = addDays(current, 1);
    }

    console.log('\n=== Tom tat ===');
    for (const r of results) {
      console.log(`${r.dateKey}: ${r.status} - ${r.reason}`);
    }
  } finally {
    await context.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
