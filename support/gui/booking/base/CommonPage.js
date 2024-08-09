export default class CommonPage {
    loadSelector(mobileSelector, desktopSelector) {
        cy.step('load selector based on viewport');
        if (Cypress.config('viewportWidth') === 1280) {
            return desktopSelector;
        }
        return mobileSelector;
    }

    getViewPort(viewport) {
        cy.step('Get screen viewport');
        if (viewport === Cypress.config('viewportWidth')) {
            return true;
        }
        return false;
    }

    checkLogoDisplay() {
        cy.step('Check logo is displayed');
        cy.get('.brand-logo').should('be.visible');
    }

    getFormattedDate(daysToAdd = 1) {
        const currentDate = new Date();
        // Add specified days to the current date
        currentDate.setDate(currentDate.getDate() + daysToAdd);
        // Format the result in the desired format (YYYY-MM-DD)
        const formattedDate = currentDate.toISOString().split('T')[0];
        return formattedDate;
    }
}
