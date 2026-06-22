import HomePage from '../../pages/HomePage';

interface UserData {
    name: string;
    email: string;
    password: string;
}

describe('Read Data from external file', { tags: '@ui' }, () => {
    let fixtureData: UserData;
    const homePage = new HomePage();
    const url = 'https://rahulshettyacademy.com/angularpractice/';

    beforeEach(() => {
        cy.fixture('example').then((data) => {
            fixtureData = data;
        });
    });

    it('login to app', { tags: ['@smoke', '@ui'] }, () => {
        homePage.goTo(url);
        homePage.login(fixtureData.name, fixtureData.email, fixtureData.password);
    });
});
