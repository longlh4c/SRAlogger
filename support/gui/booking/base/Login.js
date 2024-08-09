/* eslint-disable radix */
import ConfigHelper from '../../../lib/ConfigHelper';
import CommonPage from './CommonPage';

const ELEMENT = {
   
}

class Login extends CommonPage {
    verifyUrl() {
        cy.step('Verify the URL to login page');
        cy.url().should('contain', '/login');
    }
}
export default new Login();
