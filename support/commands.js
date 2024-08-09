/* eslint-disable arrow-body-style */
/* eslint-disable import/newline-after-import */
/* eslint-disable import/no-extraneous-dependencies */


Cypress.Commands.add('validateBrowserPerformance', () => {
    if (Cypress.env('enablePerformanceValidation') === true) {
        cy.lighthouse(
            {
                performance: 10,
                accessibility: 10,
                'best-practices': 10,
                seo: 10,
                pwa: 10,
            }
        );
    }
});
