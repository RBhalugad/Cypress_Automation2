import type { Post, User } from '../../types/api.types';

describe('cy.intercept — Mocking & Stubbing', { tags: '@api' }, () => {
    // ── Full stub ─────────────────────────────────────────────────────────────────

    it('intercepts and mocks a GET response', () => {
        const mockUsers: Partial<User>[] = [{ id: 1, name: 'Mocked User' }];

        cy.intercept('GET', '/api/users', {
            statusCode: 200,
            body: mockUsers,
        }).as('getUsers');

        // Note: This requires a running frontend app.
        // cy.visit('/users');
        // cy.wait('@getUsers');
        // cy.contains('Mocked User').should('be.visible');
        cy.log('Mock intercept registered for GET /api/users');
    });

    // ── Spy (no mock) ─────────────────────────────────────────────────────────────

    it('spies on a request without mocking (pattern demo)', () => {
        cy.intercept('GET', '**/posts/1').as('getPost');

        cy.request('https://jsonplaceholder.typicode.com/posts/1');

        // In a real UI test:
        // cy.wait('@getPost').then(({ request, response }) => {
        //     expect(response?.statusCode).to.eq(200);
        // });
        cy.log('Spy intercept registered — pattern for UI tests');
    });

    // ── Network error simulation ──────────────────────────────────────────────────

    it('simulates a network failure (pattern demo)', () => {
        cy.intercept('GET', '/api/products', { forceNetworkError: true }).as('networkFail');

        // In a real UI test:
        // cy.visit('/products');
        // cy.wait('@networkFail');
        // cy.contains('Failed to load products').should('be.visible');
        cy.log('Network error intercept registered');
    });

    // ── Delayed response ──────────────────────────────────────────────────────────

    it('shows loading spinner during a slow API call (pattern demo)', () => {
        cy.intercept('GET', '/api/data', (req) => {
            req.reply((res) => {
                res.setDelay(3000);
                res.send({ statusCode: 200, body: { data: 'loaded' } });
            });
        }).as('slowRequest');

        // In a real UI test:
        // cy.visit('/dashboard');
        // cy.get('.loading-spinner').should('be.visible');
        // cy.wait('@slowRequest');
        // cy.get('.loading-spinner').should('not.exist');
        cy.log('Delayed response intercept registered');
    });

    // ── Regex URL match ───────────────────────────────────────────────────────────

    it('intercepts requests matching a URL pattern', () => {
        cy.intercept('GET', /\/posts\/\d+/, { fixture: 'post.json' }).as('getPost');

        // In a real UI test:
        // cy.visit('/posts/1');
        // cy.wait('@getPost');
        cy.log('Regex intercept registered for /posts/:id');
    });

    // ── Modify a real response ─────────────────────────────────────────────────────

    it('intercepts and mutates a real response (pattern demo)', () => {
        cy.intercept('GET', '**/posts/1', (req) => {
            req.reply((res) => {
                // Inject a field that doesn't exist in real API
                (res.body as Record<string, unknown>).isPromoted = true;
                res.send();
            });
        }).as('mutatedPost');

        cy.log('Response mutation intercept registered');
    });

    // ── Stub with a fixture file ──────────────────────────────────────────────────

    it('stubs a response from a fixture file', () => {
        cy.intercept('GET', '**/posts/1', { fixture: 'post.json' }).as('stubbedPost');

        cy.log('Fixture-based stub registered for GET /posts/1');
    });

    // ── Intercept and assert request body ────────────────────────────────────────

    it('intercepts a POST and validates the request body (pattern demo)', () => {
        const expectedPayload: Partial<Post> = {
            title: 'Test Post',
            userId: 1,
        };

        cy.intercept('POST', '**/posts', (req) => {
            expect(req.body).to.deep.include(expectedPayload);
            req.reply({ statusCode: 201, body: { ...req.body, id: 101 } });
        }).as('createPost');

        cy.log('POST body assertion intercept registered');
    });
});
