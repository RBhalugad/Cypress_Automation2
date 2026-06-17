describe('My First Test Suite', () => {
    it('lunch application', () => {
        cy.visit('https://rahulshettyacademy.com/seleniumPractise/#/');
        cy.get('input.search-keyword').type('ca');
        cy.get('.product:visible').should('have.length', 4);
        cy.get('.products').find('.product').should('have.length', 4);
        cy.get('.products').find('.product').eq(2).contains('ADD TO CART').click();

        cy.get('.products:visible')
            .find('.product')
            .each(($el) => {
                const textVeg = $el.find('h4.product-name').text();
                cy.log(textVeg);

                if (textVeg.includes('Cashews')) {
                    cy.wrap($el.find('button')).click();
                }
            });
        cy.get('.brand').should('have.text', 'GREENKART');
        cy.get('.brand').then((logoElement) => {
            cy.log(logoElement.text());
        });
    });
});
