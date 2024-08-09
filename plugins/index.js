/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
const { lighthouse, pa11y, prepareAudit } = require('cypress-audit');
const getCompareSnapshotsPlugin = require('cypress-image-diff-js/dist/plugin');


/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
    on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium') {
            launchOptions.args.push('--disable-dev-shm-usage');
            launchOptions.args.push('--disable-gpu');
        }
        return launchOptions;
    });
    on('task', {
        lighthouse: lighthouse(), // calling the function is important
        pa11y: pa11y(), // calling the function is important
    });

    // optional: register cypress-grep plugin code
    // https://github.com/cypress-io/cypress-grep
    require('cypress-grep/src/plugin')(config);
    getCompareSnapshotsPlugin(on, config);

    return config;
};
