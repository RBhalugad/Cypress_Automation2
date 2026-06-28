const stubWindowOpen = () => {
    cy.window().then((win) => {
        const fakeWindow = {
            document: {
                write: cy.stub().as('docWrite'),
            },
        };
        cy.stub(win, 'open').as('newTab').returns(fakeWindow);
    });
};

describe('Handling Browser Windows and Datasets', () => {
    const baseUrl = 'https://demoqa.com/';

    beforeEach(() => {
        cy.visit(baseUrl);
        cy.get('.card-body')
            .find('h5')
            .each(($el) => {
                const text = $el.text();
                if (text === 'Alerts, Frame & Windows') {
                    $el.click();
                }
            });
    });
    const testData = [
        { name: 'Randhir', email: 'randhir@test.com', phoneNo: '+91-93243484' },
        { name: 'Nikhil', email: 'nikhil@test.com', phoneNo: '+91-12345555' },
        { name: 'Neha', email: 'neha@test.com', phoneNo: '+91-34948902' },
    ];

    testData.forEach(({ name, email, phoneNo }) => {
        it(`Should run with dataset: ${name}`, () => {
            cy.log(`name :${name} ---------- email :${email} ----------- phoneNo: ${phoneNo}`);
        });
    });

    it(`Handling multiple windows - New Window Message`, () => {
        cy.get('div:nth-of-type(3) #item-0 span.text').click();
        cy.get('div.show #item-0').should('have.class', 'active');

        stubWindowOpen();

        cy.get('#messageWindowButton').click();

        cy.get('@newTab').should('have.been.called');

        cy.get('@docWrite').should(
            'have.been.calledWithMatch',
            'Knowledge increases by sharing but not by saving. Please share this website with your friends and in your organization.',
        );
    });

    it(`Handling multiple windows - New Window`, () => {
        cy.contains('span.text', 'Browser Windows').click({ force: true });

        cy.window().then((win) => {
            cy.stub(win, 'open').as('newTab');
        });

        cy.get('#windowButton').click();

        cy.get('@newTab')
            .should('have.been.called')
            .its('firstCall.args.0')
            .then((url) => {
                const fullUrl = url.startsWith('http') ? url : `https://demoqa.com${url}`;
                cy.visit(fullUrl);
            });

        cy.get('#sampleHeading').should('have.text', 'This is a sample page');
    });

    it.only(`Handling multiple windows - New Tab`, () => {
        cy.contains('span.text', 'Browser Windows').click({ force: true });

        cy.window().then((win) => {
            cy.stub(win, 'open').as('newTab');
        });

        cy.get('#tabButton').click();

        cy.get('@newTab')
            .should('have.been.called')
            .its('firstCall.args.0')
            .then((url) => {
                const fullUrl = url.startsWith('http') ? url : `https://demoqa.com${url}`;
                cy.visit(fullUrl);
            });

        cy.get('#sampleHeading').should('have.text', 'This is a sample page');
    });
});
