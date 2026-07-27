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
 *   Defaults to "Monday of last week".
 *
 * Run with plain `node`, not `npx`/`npm run`.
 */

const { chromium } = require('playwright');
const config = require('./config');
const TimesheetPage = require('./lib/TimesheetPage');
const { addDays, isWeekend, getNextWeekday, getLastWeekMondayOffset } = require('./lib/dateUtils');

async function processDate(timesheetPage, target) {
  const dateKey = target.toISOString().slice(0, 10);

  const dialog = await timesheetPage.openLogDialogFor(target);
  const dayCell = await timesheetPage.selectCalendarDay(dialog, target);

  const isDisabled = await dayCell
    .evaluate((el) => el.classList.contains('flatpickr-disabled'))
    .catch(() => true);

  if (isDisabled) {
    await timesheetPage.cancelDialog(dialog);
    return { dateKey, status: 'skipped', reason: 'ngay bi disable tren lich' };
  }

  await dayCell.click();
  await timesheetPage.page.waitForTimeout(1000); // let the hours-info block refresh

  const { allocatedHrs, workLogHrs } = await timesheetPage.readHoursInfo(dialog);

  if (allocatedHrs === 0) {
    await timesheetPage.cancelDialog(dialog);
    return { dateKey, status: 'skipped', reason: 'ngay le / khong co allocated hours' };
  }

  if (workLogHrs !== 0) {
    await timesheetPage.cancelDialog(dialog);
    return { dateKey, status: 'skipped', reason: `da log roi (${workLogHrs}h)` };
  }

  await timesheetPage.fillAndSubmitLogWork(dialog);
  return { dateKey, status: 'logged', reason: `${config.logEntry.hours}h` };
}

async function logWeek(timesheetPage, startOffset) {
  let current = addDays(new Date(), startOffset);
  const results = [];

  for (let i = 0; i < config.timesheet.daysToLog; i += 1) {
    if (isWeekend(current)) {
      current = getNextWeekday(current);
    }

    try {
      const result = await processDate(timesheetPage, current);
      results.push(result);
      console.log(`[${result.status}] ${result.dateKey}: ${result.reason}`);
    } catch (err) {
      results.push({ dateKey: current.toISOString().slice(0, 10), status: 'error', reason: err.message });
      console.error(`[error] ${current.toISOString().slice(0, 10)}: ${err.message}`);
    }

    current = addDays(current, 1);
  }

  return results;
}

async function main() {
  const offsetArg = process.argv[2];
  const offset = offsetArg !== undefined ? parseInt(offsetArg, 10) : getLastWeekMondayOffset();

  const context = await chromium.launchPersistentContext(config.browser.profileDir, {
    headless: false,
    executablePath: config.browser.executablePath,
  });

  const page = context.pages()[0] ?? (await context.newPage());
  const timesheetPage = new TimesheetPage(page, config);

  try {
    await timesheetPage.ensureLoggedIn();
    const results = await logWeek(timesheetPage, offset);

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
