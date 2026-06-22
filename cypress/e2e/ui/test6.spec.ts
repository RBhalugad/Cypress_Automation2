describe('Child Window', { tags: '@ui' }, () => {
    it.skip('Handling Child Windows', { tags: ['@regression', '@ui'] }, () => {
        cy.visit('https://rahulshettyacademy.com/AutomationPractice/');
        cy.get('#opentab').invoke('removeAttr', 'target').click();

        cy.origin('https://www.qaclickacademy.com', () => {
            cy.on('uncaught:exception', (err, runnable) => {
                return false;
            });
            cy.get("#navbarSupportedContent a[href='about.html']").click();
            cy.url().should('include', 'www.qaclickacademy.com/about.html');
            cy.get('.page-banner-cont > h2').should('contain', 'About Us');
        });
    });
});
