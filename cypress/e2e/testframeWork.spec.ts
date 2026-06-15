import HomePage from '../support/pages/HomePage';

describe('Read Data from external file', () => {
  let fixtureData: { name: string; email: string; password: string };
  const homePage = new HomePage();

  before(() => {
    cy.fixture('example').then((data) => {
      fixtureData = data;
    });
  });

  it('login to app', () => {
    homePage.goTo('https://rahulshettyacademy.com/angularpractice/');
    homePage.login(fixtureData.name, fixtureData.email, fixtureData.password);
  });
});
