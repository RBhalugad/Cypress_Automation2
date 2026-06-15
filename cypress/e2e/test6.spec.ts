describe('Child Window', () => {
    it('Handling Child Windows', () => {
        cy.visit('https://rahulshettyacademy.com/AutomationPractice/');
        cy.get('#opentab').invoke('removeAttr', 'target').click();

        cy.origin('https://www.qaclickacademy.com', () => {
            cy.get("#navbarSupportedContent a[href='about.html']").click();
            cy.url().should('include', 'www.qaclickacademy.com/about.html');
            cy.get('.page-banner-cont > h2').should('contain', 'About Us');
        });
    });
});
