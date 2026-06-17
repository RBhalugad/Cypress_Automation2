class ConfirmationPage {
    private successAlert = "div[class^='alert alert-success '] strong";
    private successText = 'Success';

    getAlertMessage(): void {
        cy.get(this.successAlert).should('contain', this.successText);
    }
}

export default ConfirmationPage;
