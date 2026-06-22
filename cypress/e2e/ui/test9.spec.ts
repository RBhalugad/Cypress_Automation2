describe('Handling windows', { tags: '@ui' }, () => {
    it('new window', { tags: ['@regression', '@ui'] }, () => {
        cy.visit('https://rahulshettyacademy.com/AutomationPractice/');

        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpen');
        });
        cy.get('#openwindow').click();
        const url = cy.url();
        cy.log(url as unknown as string);
    });
});
