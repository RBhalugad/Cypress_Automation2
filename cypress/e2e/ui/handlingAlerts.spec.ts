describe('Handling Alerts', () => {
    beforeEach(() => {
        cy.visit('https://demoqa.com/alerts');
    });

    it('handles Normal Alert', () => {
        const alertStub = cy.stub().as('alertStub');
        cy.on('window:alert', alertStub);

        cy.get('button#alertButton').click();
        cy.get('@alertStub').should('have.been.calledWith', 'You clicked a button');
    });

    it('handles Timer Alert', () => {
        const alertStub = cy.stub().as('alertStub');
        cy.on('window:alert', alertStub);

        cy.get('#timerAlertButton').click();
        // Wait for the 5-second timer
        cy.wait(5500); // 5.5s just to be safe
        cy.get('@alertStub').should('have.been.calledWith', 'This alert appeared after 5 seconds');
    });

    it('handles Confirm Dialog', () => {
        // By default Cypress auto-accepts confirms, but we can also stub it to be explicit
        cy.on('window:confirm', (str) => {
            expect(str).to.equal('Do you confirm action?');
            return true; // Click OK
        });
        cy.get('#confirmButton').click();
        cy.get('#confirmResult').should('contain.text', 'You selected Ok');
    });

    it('handles Prompt Dialog', () => {
        // Cypress doesn't natively handle prompt inputs via cy.on, so we MUST stub window.prompt
        cy.window().then((win) => {
            cy.stub(win, 'prompt').returns('This is a test');
        });
        cy.get('#promtButton').click();
        cy.get('#promptResult').should('contain.text', 'You entered This is a test');
    });
});
