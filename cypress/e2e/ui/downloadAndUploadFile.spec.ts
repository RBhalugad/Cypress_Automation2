describe('Verify download and upload functionality', () => {
    const fileName = 'shopping.jpg';
    beforeEach(() => {
        cy.visit('https://demoqa.com/upload-download');
        cy.task('deleteDownloads');
    });
    it('Verify download functionality', () => {
        cy.get('#downloadButton').click();
        cy.task('readDownloads', 'sampleFile.jpeg').then((file) => {
            expect(file).to.exist;
        });
    });

    it('Verify upload functionality', () => {
        const filePath = `${Cypress.config('fixturesFolder')}/${fileName}`;
        cy.get('#uploadFile').selectFile(filePath);
        cy.get('#uploadedFilePath').should('be.visible').and('have.text', fileName);
        cy.task('readDownloads', fileName).then((file) => {
            expect(file).to.exist;
        });
    });
});
