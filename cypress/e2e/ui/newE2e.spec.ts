import CartPage from '../../pages/CartPage';
import ConfirmationPage from '../../pages/ConfirmationPage';
import HomePage from '../../pages/HomePage';
import ProductPage from '../../pages/ProductPage';

describe('End to End test', () => {
    const productPage = new ProductPage();
    const homePage = new HomePage();
    const confirmationPage = new ConfirmationPage();
    const cartPage = new CartPage();

    it('submit order', () => {
        const productName = 'Nokia Edge';
        homePage.goTo(Cypress.env('baseurl') + '/angularpractice/shop');
        productPage.pageValidation();
        productPage.verifyCardLimit();
        productPage.selectProductByname(productName);
        productPage.selectProductByIndex(1);
        productPage.goToCart();
        cartPage.sumOfProduct().then((sum) => {
            expect(sum).to.be.lessThan(200000);
        });
        cartPage.checkout();
        cy.SubmitFormDetails();
        confirmationPage.getAlertMessage();
    });
});
