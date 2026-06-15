class HomePage {
    goTo(url: string): void {
        cy.visit(url);
    }

    login(userName: string, email: string, password: string): void {
        cy.get("input[name='name']").eq(0).type(userName);

        cy.get("input[name='email']").type(email);
        cy.get('#exampleInputPassword1').type(String(password));
        cy.get('#exampleCheck1').check().should('be.checked');

        cy.get('#exampleFormControlSelect1').select('Female').should('have.value', 'Female');
        cy.get('#inlineRadio1').check().should('be.checked');
        cy.get('#inlineRadio2').should('not.be.checked');
        cy.get('#inlineRadio3').should('be.disabled');

        cy.get(".btn[type='submit']").click();

        cy.get('.alert').contains('Success! The Form has been submitted successfully!.');
    }
}

export default HomePage;
