describe('haldling table', { tags: '@ui' }, () => {
    it('table', { tags: ['@regression', '@ui'] }, () => {
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
