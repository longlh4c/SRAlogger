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
 *   node scripts/sra-logger.js [offsetDays | --this-week] [--smartbox <hours>] [--jaspal <hours>]
 *
 *   offsetDays: days relative to today to start logging (negative = past).
 *   Defaults to "Monday of last week" (5 working days).
 *   --this-week: log from Monday of this week up to today.
 *   --smartbox 6h --jaspal 2h: one row per project per day with the given
 *   hours (e.g. "6h" or "6"). Defaults to a single Smartbox 8h row when no
 *   project flag is given. Can be combined with the options above.
 *
 * Run with plain `node`, not `npx`/`npm run`.
 */

const { chromium } = require('playwright');
const config = require('./config');
const TimesheetPage = require('./lib/TimesheetPage');
const {
  addDays,
  isWeekend,
  getNextWeekday,
  getLastWeekMondayOffset,
  getThisWeekMondayOffset,
  getThisWeekWorkdayCount,
} = require('./lib/dateUtils');

async function processDate(timesheetPage, target, entries) {
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

  await timesheetPage.fillAndSubmitLogWork(dialog, entries);
  return { dateKey, status: 'logged', reason: entries.map((e) => `${e.projectOptionName} ${e.hours}h`).join(' + ') };
}

async function logWeek(timesheetPage, startOffset, daysToLog, entries) {
  let current = addDays(new Date(), startOffset);
  const results = [];

  for (let i = 0; i < daysToLog; i += 1) {
    if (isWeekend(current)) {
      current = getNextWeekday(current);
    }

    try {
      const result = await processDate(timesheetPage, current, entries);
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

function parseHours(value, flag) {
  const match = /^(\d+(?:\.\d+)?)h?$/i.exec(value ?? '');
  if (!match || parseFloat(match[1]) <= 0) {
    throw new Error(`Gia tri gio khong hop le cho ${flag}: "${value ?? ''}" (vd: ${flag} 6h)`);
  }
  return match[1];
}

// Splits argv into project rows (--smartbox 6h --jaspal 2h) and the
// remaining positional arg (offsetDays / --this-week).
function parseArgs(argv) {
  const entries = [];
  const rest = [];

  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i].startsWith('--') ? argv[i].slice(2) : null;
    const project = key && config.projects[key];
    if (project) {
      i += 1;
      entries.push({ ...project, hours: parseHours(argv[i], argv[i - 1]) });
    } else {
      rest.push(argv[i]);
    }
  }

  if (entries.length === 0) {
    const { key, hours } = config.defaultProject;
    entries.push({ ...config.projects[key], hours });
  }
  return { entries, arg: rest[0] };
}

async function main() {
  const { entries, arg } = parseArgs(process.argv.slice(2));
  let offset;
  let daysToLog = config.timesheet.daysToLog;

  if (arg === '--this-week' || arg === 'this-week') {
    offset = getThisWeekMondayOffset();
    daysToLog = getThisWeekWorkdayCount();
  } else if (arg !== undefined) {
    offset = parseInt(arg, 10);
  } else {
    offset = getLastWeekMondayOffset();
  }

  const context = await chromium.launchPersistentContext(config.browser.profileDir, {
    headless: false,
    executablePath: config.browser.executablePath,
  });

  const page = context.pages()[0] ?? (await context.newPage());
  const timesheetPage = new TimesheetPage(page, config);

  try {
    await timesheetPage.ensureLoggedIn();
    const results = await logWeek(timesheetPage, offset, daysToLog, entries);

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
