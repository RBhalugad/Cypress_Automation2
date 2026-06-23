import type { Post } from '../../types/api.types';

describe('Response Assertions', { tags: '@api' }, () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';

    // ── Status codes ─────────────────────────────────────────────────────────────

    it('validates common HTTP status codes', () => {
        cy.request(`${baseUrl}/posts/1`).its('status').should('eq', 200);

        cy.request({
            method: 'POST',
            url: `${baseUrl}/posts`,
            body: { title: 'Test', body: 'x', userId: 1 },
        })
            .its('status')
            .should('eq', 201);

        cy.request({ method: 'DELETE', url: `${baseUrl}/posts/1` })
            .its('status')
            .should('eq', 200);

        cy.request({ method: 'GET', url: `${baseUrl}/posts/9999`, failOnStatusCode: false })
            .its('status')
            .should('eq', 404);
    });

    // ── Body structure ────────────────────────────────────────────────────────────

    it('deeply validates response body structure', () => {
        cy.request<Post>(`${baseUrl}/posts/1`).then(({ body }) => {
            // Type checks
            expect(body).to.be.an('object');
            expect(body.id).to.be.a('number');
            expect(body.title).to.be.a('string').and.not.be.empty;

            // All required keys present
            expect(body).to.have.all.keys('userId', 'id', 'title', 'body');

            // Specific values
            expect(body.id).to.eq(1);
            expect(body.userId).to.be.within(1, 10);
        });
    });

    // ── Array response ────────────────────────────────────────────────────────────

    it('validates a list response', () => {
        cy.request<Post[]>(`${baseUrl}/posts`).then(({ body }) => {
            expect(body).to.be.an('array').with.length.greaterThan(0);
            // Every item conforms to the shape
            body.slice(0, 5).forEach((post: Post) => {
                expect(post).to.have.all.keys('id', 'userId', 'title', 'body');
                expect(post.id).to.be.a('number');
            });
        });
    });

    // ── Header assertions ─────────────────────────────────────────────────────────

    it('validates response headers', () => {
        cy.request(`${baseUrl}/posts`).then((response) => {
            expect(response.headers).to.have.property('content-type');
            expect(response.headers['content-type']).to.include('application/json');
        });
    });

    // ── Reusable schema helper ────────────────────────────────────────────────────

    function assertPostShape(post: unknown): void {
        expect(post).to.have.all.keys('id', 'userId', 'title', 'body');
    }

    it('validates every post in a list using a helper', () => {
        cy.request<Post[]>(`${baseUrl}/posts`).then(({ body }) => {
            body.forEach(assertPostShape);
        });
    });

    // ── Deep equality ────────────────────────────────────────────────────────────

    it('asserts deep inclusion of a subset', () => {
        cy.request<Post>(`${baseUrl}/posts/1`).then(({ body }) => {
            expect(body).to.deep.include({ userId: 1, id: 1 });
        });
    });

    // ── Response body is not empty ────────────────────────────────────────────────

    it('asserts response body is not empty', () => {
        cy.request(`${baseUrl}/posts`).then(({ body }) => {
            expect(body).to.not.be.empty;
        });
    });
});
