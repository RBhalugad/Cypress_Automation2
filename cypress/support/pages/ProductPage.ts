class ProductPage {
    pageValidation(): void {
        cy.contains('Shop Name').should('be.visible');
    }

    verifyCardLimit(): void {
        cy.get('app-card').should('have.length', 4);
    }

    selectProductByname(productName: string): void {
        cy.get('app-card')
            .filter(`:contains("${productName}")`)
            .then(($element) => {
                cy.wrap($element).should('have.length', 1);
                cy.wrap($element).contains('button', 'Add').click();
            });
    }

    selectProductByIndex(index: number): void {
        cy.get('app-card').eq(index).contains('button', 'Add').click();
    }

    goToCart(): void {
        cy.contains('a', 'Checkout').click();
    }
}

export default ProductPage;
