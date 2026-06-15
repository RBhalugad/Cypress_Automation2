/// <reference types="cypress-iframe"/>

describe('Frame test', () => {
    it('switching to Frame', () => {
        cy.visit('https://rahulshettyacademy.com/AutomationPractice/');
        cy.getIframeBody('#courses-iframe').within(() => {
            cy.get("a[href^='mentorship']").eq(0).click({ force: true });
        });
    });
});
