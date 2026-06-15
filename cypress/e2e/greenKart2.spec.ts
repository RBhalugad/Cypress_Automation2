describe('My First Test Suite 2', () => {
  it('Shop E2E', () => {
    cy.visit('https://rahulshettyacademy.com/seleniumPractise/#/');
    cy.get('input.search-keyword').type('ca');
    cy.wait(3000);
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
    cy.wait(3000);
    cy.get("div[class='cart-preview active'] button").click();
    cy.contains('Place Order').click();
  });
});
