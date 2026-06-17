describe('E-Commerce API E2E Flow', () => {
    const baseUrl: string = Cypress.env('baseurl');
    let token: string;
    let userId: string;
    let productId: string;

    it('should login, add product, create order, and delete product', () => {
        // --- 1. Login to get Auth Token ---
        cy.log('*--- Logging in to get auth token ---*');
        cy.request({
            method: 'POST',
            url: `${baseUrl}/api/ecom/auth/login`,
            body: {
                userEmail: Cypress.env('ecom_user'),
                userPassword: Cypress.env('ecom_password'),
            },
        }).then((loginResponse) => {
            expect(loginResponse.status).to.eq(200);
            token = loginResponse.body.token;
            userId = loginResponse.body.userId;
            cy.log('*Login successful. Token and UserId obtained.*');

            // --- 2. Add Product (with Multipart Form Data for Image) ---
            cy.log('*--- Adding a new product ---*');
            cy.fixture('shopping.jpg', 'binary').then((fileContent: string) => {
                const blob = Cypress.Blob.binaryStringToBlob(fileContent, 'image/jpeg');

                const formData = new FormData();
                formData.append('productName', 'Laptop');
                formData.append('productAddedBy', userId);
                formData.append('productCategory', 'fashion');
                formData.append('productSubCategory', 'shirts');
                formData.append('productPrice', '11500');
                formData.append('productDescription', 'Lenova');
                formData.append('productFor', 'men');
                formData.append('productImage', blob, 'shopping.jpg');

                cy.request({
                    method: 'POST',
                    url: `${baseUrl}/api/ecom/product/add-product`,
                    headers: {
                        Authorization: token,
                    },
                    body: formData,
                }).then((addProductResponse) => {
                    expect(addProductResponse.status).to.eq(201);
                    productId = addProductResponse.body.productId;
                    // Validate productId is present before proceeding
                    expect(productId, 'Product ID should be returned from add-product').to.not.be
                        .undefined;
                    cy.log(`*Product added successfully. ProductId: ${productId}*`);

                    // --- 3. Create Order ---
                    cy.log('*--- Creating an order for the new product ---*');
                    const orderPayload = {
                        orders: [
                            {
                                country: 'India',
                                productOrderedId: productId,
                            },
                        ],
                    };

                    cy.request({
                        method: 'POST',
                        url: `${baseUrl}/api/ecom/order/create-order`,
                        headers: {
                            Authorization: token,
                            'Content-Type': 'application/json',
                        },
                        body: orderPayload,
                    }).then((createOrderResponse) => {
                        expect(createOrderResponse.status).to.eq(201);
                        expect(createOrderResponse.body.message).to.eq('Order Placed Successfully');
                        cy.log('*Order created successfully.*');

                        // --- 4. Delete Product ---
                        cy.log('*--- Deleting the product to clean up ---*');
                        cy.request({
                            method: 'DELETE',
                            url: `${baseUrl}/api/ecom/product/delete-product/${productId}`,
                            headers: {
                                Authorization: token,
                            },
                        }).then((deleteResponse) => {
                            expect(deleteResponse.status).to.eq(200);
                            expect(deleteResponse.body.message).to.eq(
                                'Product Deleted Successfully',
                            );
                            cy.log('*Product deleted successfully.*');
                        });
                    });
                });
            });
        });
    });
});
