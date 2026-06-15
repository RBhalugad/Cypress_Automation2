class CartPage {
    sumOfProduct(): Cypress.Chainable<number> {
        let sum = 0;
        return cy
            .get('tr td:nth-child(4) strong')
            .each(($el) => {
                const amount = Number($el.text().split(' ')[1].trim());
                sum = sum + amount;
            })
            .then(() => {
                return sum;
            });
    }

    checkout(): void {
        cy.contains('button', 'Checkout').click();
    }
}

export default CartPage;
