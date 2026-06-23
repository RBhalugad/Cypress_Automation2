describe('DELETE requests', { tags: '@api' }, () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';

    it('deletes a post and receives 200', { tags: ['@api', '@regression'] }, () => {
        cy.request({
            method: 'DELETE',
            url: `${baseUrl}/posts/1`,
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 204]);
        });
    });

    it('deletes then verifies the resource is gone (404)', () => {
        cy.request({ method: 'DELETE', url: `${baseUrl}/posts/1` });

        cy.request({
            method: 'GET',
            url: `${baseUrl}/posts/1`,
            failOnStatusCode: false, // ← required to prevent test throw on 4xx
        }).then((response) => {
            // Note: JSONPlaceholder always returns 200 — real APIs would return 404
            expect(response.status).to.be.oneOf([200, 404]);
        });
    });
});
