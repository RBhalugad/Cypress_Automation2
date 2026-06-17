class ProductPage {
    private appCard = 'app-card';
    private shopNameText = 'Shop Name';
    private addButton = 'button';
    private addText = 'Add';
    private checkoutLink = 'a';
    private checkoutText = 'Checkout';

    pageValidation(): void {
        cy.contains(this.shopNameText).should('be.visible');
    }

    verifyCardLimit(): void {
        cy.get(this.appCard).should('have.length', 4);
    }

    selectProductByname(productName: string): void {
        cy.get(this.appCard)
            .filter(`:contains("${productName}")`)
            .then(($element) => {
                cy.wrap($element).should('have.length', 1);
                cy.wrap($element).contains(this.addButton, this.addText).click();
            });
    }

    selectProductByIndex(index: number): void {
        cy.get(this.appCard).eq(index).contains(this.addButton, this.addText).click();
    }

    goToCart(): void {
        cy.contains(this.checkoutLink, this.checkoutText).click();
    }
}

export default ProductPage;
