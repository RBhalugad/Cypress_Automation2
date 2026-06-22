/// <reference types="cypress-iframe"/>

describe('Frame test', { tags: '@ui' }, () => {
    it('switching to Frame', { tags: ['@regression', '@ui'] }, () => {
        cy.visit('https://rahulshettyacademy.com/AutomationPractice/');
        cy.getIframeBody('#courses-iframe').within(() => {
            cy.get("a[href^='mentorship']").eq(0).click({ force: true });
        });
    });
});
