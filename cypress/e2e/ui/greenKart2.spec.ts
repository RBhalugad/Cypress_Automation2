describe('My First Test Suite 2', { tags: '@ui' }, () => {
    it('Shop E2E', { tags: ['@e2e', '@ui'] }, () => {
        cy.visit('https://rahulshettyacademy.com/seleniumPractise/#/');
        cy.get('input.search-keyword').type('ca');
        cy.get('.product:visible').should('have.length', 4);

        cy.get('.products:visible')
            .find('.product')
            .each(($el) => {
                const textVeg = $el.find('h4.product-name').text();

                if (textVeg.includes('Cashews')) {
                    cy.wrap($el.find('button')).click();
                }
            });
        cy.get('.brand').should('have.text', 'GREENKART');
        cy.get('.cart-icon').click();
        cy.get("div[class='cart-preview active'] button").click();
        cy.contains('Place Order').click();
    });
});
