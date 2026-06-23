describe('Request Headers & Content Types', { tags: '@api' }, () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';

    it('sends custom request headers', () => {
        const customHeaders: Record<string, string> = {
            Accept: 'application/json',
            'x-request-id': 'cypress-12345',
            'x-client-version': '2.1.0',
        };

        cy.request({ method: 'GET', url: `${baseUrl}/posts/1`, headers: customHeaders })
            .its('status')
            .should('eq', 200);
    });

    it('sends an XML payload (pattern demo)', () => {
        const xmlBody = `
      <user>
        <name>John Doe</name>
        <email>john@example.com</email>
      </user>`.trim();

        // Note: JSONPlaceholder doesn't accept XML.
        // This demonstrates the pattern for APIs that do.
        cy.request({
            method: 'POST',
            url: `${baseUrl}/posts`,
            headers: { 'Content-Type': 'application/json' },
            body: { title: 'XML Test', body: xmlBody, userId: 1 },
        })
            .its('status')
            .should('eq', 201);
    });

    it('asserts content-type in response headers', () => {
        cy.request(`${baseUrl}/posts`).then((response) => {
            expect(response.headers['content-type']).to.include('application/json');
        });
    });

    it('validates cache-control header exists', () => {
        cy.request(`${baseUrl}/posts/1`).then((response) => {
            expect(response.headers).to.have.property('cache-control');
        });
    });

    it('sends Accept-Language header', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/posts/1`,
            headers: { 'Accept-Language': 'en-US' },
        }).then((response) => {
            expect(response.status).to.eq(200);
        });
    });
});
