describe('haldling table', () => {
    it('table', () => {
        cy.visit('https://rahulshettyacademy.com/AutomationPractice/');
        cy.get('.left-align #product tr td:nth-child(2)').each(($el, index) => {
            const text = $el.text();
            if (text.includes('Python')) {
                cy.get('.left-align #product tr td:nth-child(2)')
                    .eq(index)
                    .next()
                    .then((price) => {
                        const priceText = price.text();
                        expect(priceText).to.equal('25');
                    });
            }
        });
    });
});
