module.exports = {
  browser: {
    profileDir: '/home/longlh/snap/chromium/common/chromium-mcp',
    executablePath: '/snap/bin/chromium',
  },
  timesheet: {
    url: 'https://sra.smartosc.com/time-sheet',
    daysToLog: 5,
  },
  // Projects selectable from the CLI via --<key> <hours>, e.g. --smartbox 6h --jaspal 2h.
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
  // Used when no project flag is given: a single Smartbox row.
  defaultProject: { key: 'smartbox', hours: '8' },
};
