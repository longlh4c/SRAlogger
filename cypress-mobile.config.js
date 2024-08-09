/* eslint-disable import/no-extraneous-dependencies */

const { defineConfig } = require('cypress');

module.exports = defineConfig({
    projectId: 'jarvis',
    viewportWidth: 390,
    viewportHeight: 812,
    video: false,
    watchForFileChanges: true,
    includeShadowDom: true,
    numTestsKeptInMemory: 0,
    experimentalMemoryManagement: true,
    retries: {
        runMode: 1,
    },
    blockHosts: [
        '**dev.visualwebsiteoptimizer.com',
        '*google-analytics.com',
        'googletagmanager.com',
        '*newrelic.com',
        '*nr-data.net',
        'tr.snapchat.com',
        '*creativecdn.com',
        'geolocation.onetrust.com',
        'cdn.cookielaw.org',
        '*bam.nr-data.net',
        'cdn.cookielaw.org'
    ],
    defaultCommandTimeout: 25000,
    requestTimeout: 25000,
    screenshotsFolder: 'cypress/screenshots',
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
            // eslint-disable-next-line global-require
            return require('./plugins/index')(on, config);
        },
        supportFile: './support/e2e.js',
        specPattern: './e2e/**/*test.js',
    },
});
