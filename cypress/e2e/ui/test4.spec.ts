describe('Handling DropDown', { tags: '@ui' }, () => {
    it('static checkbox', { tags: ['@regression', '@ui'] }, () => {
        cy.visit('https://rahulshettyacademy.com/AutomationPractice/');
        cy.get('#dropdown-class-example').select('option2').should('have.value', 'option2');
        cy.get('#autocomplete').type('ind');

        cy.get('.ui-menu-item div').each(($el) => {
            const optionToSelect = $el.text();
            cy.log(optionToSelect);

            if (optionToSelect.includes('India')) {
                cy.wrap($el).click({ force: true });
            }
        });
        cy.get('#autocomplete').should('have.value', 'India');
    });

    it('visible & Invisible', { tags: ['@regression', '@ui'] }, () => {
        cy.visit('https://rahulshettyacademy.com/AutomationPractice/');
        cy.get('#displayed-text').should('be.visible');
        cy.get('#hide-textbox').click();
        cy.get('#displayed-text').should('not.be.visible');
        cy.get('#show-textbox').click();
        cy.get('#displayed-text').should('be.visible');
    });

    it('radio button', { tags: ['@regression', '@ui'] }, () => {
        cy.visit('https://rahulshettyacademy.com/AutomationPractice/');
        cy.get('[for="radio1"] > .radioButton').check().should('be.checked');
        cy.get('[for="radio2"] > .radioButton').should('not.be.checked');
    });
});
