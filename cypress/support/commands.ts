// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Extend Cypress chainable interface to add custom commands with TypeScript types
declare namespace Cypress {
    interface Chainable {
        SubmitFormDetails(): Chainable<void>;
        getIframeBody(iframeSelector: string): Chainable<JQuery<HTMLBodyElement>>;
    }
}

Cypress.Commands.add('SubmitFormDetails', () => {
    cy.get('#country').type('Ind');
    cy.get('.suggestions ul li a').eq(0).click({ force: true });
    cy.get('#checkbox2').check({ force: true }).should('be.checked');
    cy.get('.ng-untouched > .btn').click();
});

Cypress.Commands.add('getIframeBody', (iframeSelector: string) => {
    cy.get(iframeSelector).its('0.contentDocument.body').should('not.be.empty').then(cy.wrap);
});
