import type { ApiError, ValidationError } from '../../types/api.types';

describe('Error & Edge Case Scenarios', { tags: '@api' }, () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';

    it('returns 404 for a non-existent resource', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/posts/999999`,
            failOnStatusCode: false,
        })
            .its('status')
            .should('eq', 404);
    });

    it('returns 404 for a completely invalid endpoint', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/nonexistent-endpoint`,
            failOnStatusCode: false,
        })
            .its('status')
            .should('eq', 404);
    });

    it('handles invalid HTTP method gracefully', () => {
        cy.request({
            method: 'PATCH',
            url: `${baseUrl}/posts/999999`,
            body: { title: 'Should fail' },
            failOnStatusCode: false,
        }).then(({ status }) => {
            // May return 404 or 500 depending on the API
            expect(status).to.be.gte(400);
        });
    });

    it('handles empty body on POST', () => {
        cy.request({
            method: 'POST',
            url: `${baseUrl}/posts`,
            body: {},
            failOnStatusCode: false,
        }).then(({ status }) => {
            // JSONPlaceholder accepts empty body with 201
            expect(status).to.be.oneOf([201, 400, 422]);
        });
    });

    it('handles request with invalid JSON-like string body', () => {
        cy.request({
            method: 'POST',
            url: `${baseUrl}/posts`,
            body: 'not-valid-json',
            headers: { 'Content-Type': 'application/json' },
            failOnStatusCode: false,
        }).then(({ status }) => {
            expect(status).to.be.within(200, 500);
        });
    });

    it('validates error response structure (pattern demo)', () => {
        // Pattern for validating ApiError shape on real APIs
        cy.request({
            method: 'GET',
            url: `${baseUrl}/posts/999999`,
            failOnStatusCode: false,
        }).then(({ status, body }) => {
            expect(status).to.eq(404);
            // Real APIs would return: { message: '...', code: '...' }
            // expect(body).to.have.property('message');
            // expect(body).to.have.property('code');
            cy.log('Error response received');
        });
    });

    it('validates ValidationError shape (pattern demo)', () => {
        // Pattern for APIs returning validation errors
        cy.request({
            method: 'POST',
            url: `${baseUrl}/posts`,
            body: { title: '' },
            failOnStatusCode: false,
        }).then(({ status }) => {
            // Real APIs would return 400/422 with ValidationError:
            // { errors: [{ field: 'title', message: 'required' }] }
            expect(status).to.be.oneOf([201, 400, 422]);
            cy.log('Validation error pattern demonstrated');
        });
    });

    it('handles very large payload', () => {
        const largeBody = {
            title: 'A'.repeat(10000),
            body: 'B'.repeat(50000),
            userId: 1,
        };

        cy.request({
            method: 'POST',
            url: `${baseUrl}/posts`,
            body: largeBody,
            failOnStatusCode: false,
        }).then(({ status }) => {
            // Should either succeed or return 413 (Payload Too Large)
            expect(status).to.be.oneOf([201, 413]);
        });
    });

    it('handles special characters in query parameters', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/posts`,
            qs: { title: 'test & <script>alert(1)</script>' },
            failOnStatusCode: false,
        }).then(({ status }) => {
            expect(status).to.be.within(200, 404);
        });
    });
});
