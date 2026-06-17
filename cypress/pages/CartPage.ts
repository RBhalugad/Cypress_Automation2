class CartPage {
    private productAmountSelector = 'tr td:nth-child(4) strong';
    private checkoutButtonText = 'Checkout';
    private checkoutButtonSelector = 'button';

    sumOfProduct(): Cypress.Chainable<number> {
        let sum = 0;
        return cy
            .get(this.productAmountSelector)
            .each(($el) => {
                const amount = Number($el.text().split(' ')[1].trim());
                sum = sum + amount;
            })
            .then(() => {
                return sum;
            });
    }

    checkout(): void {
        cy.contains(this.checkoutButtonSelector, this.checkoutButtonText).click();
    }
}

export default CartPage;
