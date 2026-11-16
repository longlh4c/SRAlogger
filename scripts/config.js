const os = require('os');
const path = require('path');
const fs = require('fs');

// Use whichever Playwright Chromium is already installed (avoids revision mismatch).
function findInstalledChromium() {
  const root = path.join(os.homedir(), '.cache', 'ms-playwright');
  const dirs = fs.readdirSync(root).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
  for (const d of dirs) {
    const bin = path.join(root, d, 'chrome-linux64', 'chrome');
    if (fs.existsSync(bin)) return bin;
  }
  return undefined;
}

module.exports = {
  browser: {
    profileDir: path.join(os.homedir(), '.sra-logger-profile'),
    executablePath: findInstalledChromium(),
  },
  timesheet: {
    url: 'https://sra.smartosc.com/time-sheet',
    daysToLog: 5,
  },
  // Presets selectable from the CLI via --<key> <hours>, e.g. --smartbox 6h --jaspal 2h.
  // Each one becomes one row in the Log Time dialog (same day).
  projects: {
    smartbox: {
      projectSearch: 'Smartbox Dedicated team',
      projectOptionName: 'Smartbox Dedicated Team',
      typeOfWorkSearch: 'Test execution',
      typeOfWorkOptionName: 'Test execution',
      description: 'Manual & Auto test',
    },
    jaspal: {
      projectSearch: 'Jaspal',
      projectOptionName: 'Jaspal',
      typeOfWorkSearch: 'Test execution',
      typeOfWorkOptionName: 'Test execution',
      description: 'Manual & Auto test',
    },
  },
  // Any other --<name> <hours> flag (e.g. --lhub 4h) selects the project whose
  // name contains <name>, and fills the row with these defaults.
  projectDefaults: {
    typeOfWorkSearch: 'Test execution',
    typeOfWorkOptionName: 'Test execution',
    description: 'Manual & Auto test',
  },
  // Used when no project flag is given: a single Smartbox row.
  defaultProject: { key: 'smartbox', hours: '8' },
};
