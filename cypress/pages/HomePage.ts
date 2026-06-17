class HomePage {
    private userNameInput = "input[name='name']";
    private emailInput = "input[name='email']";
    private passwordInput = '#exampleInputPassword1';
    private rememberMeCheckbox = '#exampleCheck1';
    private genderSelect = '#exampleFormControlSelect1';
    private inlineRadio1 = '#inlineRadio1';
    private inlineRadio2 = '#inlineRadio2';
    private inlineRadio3 = '#inlineRadio3';
    private submitButton = ".btn[type='submit']";
    private alertMessage = '.alert';

    goTo(url: string): void {
        cy.visit(url);
    }

    login(userName: string, email: string, password: string): void {
        cy.get(this.userNameInput).eq(0).type(userName);
        cy.get(this.emailInput).type(email);
        cy.get(this.passwordInput).type(String(password));
        cy.get(this.rememberMeCheckbox).check().should('be.checked');
        cy.get(this.genderSelect).select('Female').should('have.value', 'Female');
        cy.get(this.inlineRadio1).check().should('be.checked');
        cy.get(this.inlineRadio2).should('not.be.checked');
        cy.get(this.inlineRadio3).should('be.disabled');
        cy.get(this.submitButton).click();
        cy.get(this.alertMessage).contains('Success! The Form has been submitted successfully!.');
    }
}

export default HomePage;
