describe('Handling Alert', { tags: '@ui' }, () => {
    it('handling alert', { tags: ['@regression', '@ui'] }, () => {
        cy.visit('https://rahulshettyacademy.com/AutomationPractice/');
        cy.get('#alertbtn').click();

        cy.get('#confirmbtn').click();

        cy.on('window:alert', (str: string) => {
            expect(str).to.equal('Hello , share this practice page and share your knowledge');
        });

        cy.on('window:confirm', (str: string) => {
            expect(str).to.equal('Hello , Are you sure you want to confirm?');
        });
    });
});
