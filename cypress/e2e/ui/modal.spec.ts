describe('Handling modals', () => {
    beforeEach(() => {
        cy.visit('https://demoqa.com/modal-dialogs');
    });

    it('handling small modal', () => {
        cy.get('#showSmallModal').click();
        cy.get('.modal-content').should('be.visible').as('modal');

        cy.get('@modal').find('.modal-header').should('contain.text', 'Small Modal');
        cy.get('@modal')
            .find('.modal-body')
            .should('contain.text', 'This is a small modal. It has very less content');

        // Close the modal
        cy.get('@modal').find('.modal-footer').find('button#closeSmallModal').click();

        // Assert modal is gone using standard chained assertions
        cy.get('.modal-content').should('not.exist');
    });

    it('handling large modal', () => {
        cy.get('#showLargeModal').click();
        cy.get('.modal-content').should('be.visible').as('largeModal');

        cy.get('@largeModal').find('.modal-header').should('contain.text', 'Large Modal');
        cy.get('@largeModal').find('.modal-body').should('contain.text', 'Lorem Ipsum');

        // Close the modal
        cy.get('@largeModal').find('.modal-footer').find('button#closeLargeModal').click();

        cy.get('.modal-content').should('not.exist');
    });
});
