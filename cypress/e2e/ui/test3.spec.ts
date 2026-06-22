describe('Handling Checkboxes', { tags: '@ui' }, () => {
    it('handling checkboxes', { tags: ['@regression', '@ui'] }, () => {
        cy.visit('https://rahulshettyacademy.com/AutomationPractice/');
        cy.get('#checkBoxOption1').check().should('be.checked').and('have.value', 'option1');
        cy.get('#checkBoxOption1').uncheck().should('not.be.checked');
        cy.get("input[type='checkbox']").first().check().should('be.checked');
        cy.get("input[type='checkbox']").check(['option2', 'option3']);
        cy.get("input[type='checkbox']").uncheck();
    });
});
