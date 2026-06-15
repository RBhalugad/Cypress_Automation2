class ConfirmationPage {
    getAlertMessage(): void {
        cy.get("div[class^='alert alert-success '] strong").should('contain', 'Success');
    }
}

export default ConfirmationPage;
