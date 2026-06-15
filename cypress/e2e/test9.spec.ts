describe('Handling windows', () => {
  it('new window', () => {
    cy.visit('https://rahulshettyacademy.com/AutomationPractice/');

    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });
    cy.get('#openwindow').click();
    const url = cy.url();
    cy.log(url as unknown as string);
  });
});
