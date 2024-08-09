/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/newline-after-import */
// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import moment from 'moment';
import 'cypress-plugin-steps';
require('cypress-grep')();
require('cypress-xpath');

// Alternatively you can use CommonJS syntax:
// require('./commands')
before(() => {
    global.executionStartTime = moment().format('MMM DD, YYYY, h:mm:ss a');
});

beforeEach(() => {
    global.emailAddress = `booking${Math.floor((Math.random() * 999999999) + 1)}@smartbox.com`;
});
