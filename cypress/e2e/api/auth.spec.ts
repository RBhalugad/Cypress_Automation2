import type { LoginPayload, LoginResponse, OAuthTokenResponse } from '../../types/api.types';

describe('Authentication Scenarios', { tags: '@api' }, () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';

    // ── 7.1 Basic Auth ──────────────────────────────────────────────────────────

    it('authenticates with Basic Auth', () => {
        cy.request<{ authenticated: boolean; user: string }>({
            method: 'GET',
            url: 'https://httpbin.org/basic-auth/user/pass',
            auth: { username: 'user', password: 'pass' },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.authenticated).to.be.true;
        });
    });

    // ── 7.2 Bearer Token ────────────────────────────────────────────────────────

    it('calls a protected endpoint with a Bearer token', () => {
        const token: string = Cypress.env('authToken');

        cy.request({
            method: 'GET',
            url: `${baseUrl}/posts/1`,
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            expect(response.status).to.eq(200);
        });
    });

    // ── 7.3 Login flow — get token, then use it ─────────────────────────────────

    describe('Token-based Auth flow', () => {
        let authToken: string;

        before(() => {
            const credentials: LoginPayload = {
                username: 'admin',
                password: 'password123',
            };

            // Note: JSONPlaceholder doesn't have a real login endpoint.
            // In a real project, replace with your actual auth endpoint.
            cy.request<LoginResponse>({
                method: 'POST',
                url: `${baseUrl}/posts`, // Simulated — replace with real auth endpoint
                body: credentials,
                failOnStatusCode: false,
            }).then((response) => {
                // Simulated: store a mock token for demonstration
                authToken = 'mock-jwt-token-for-testing';
                cy.log(`Auth token set: ${authToken}`);
            });
        });

        it('accesses a protected route using the obtained token', () => {
            cy.request({
                method: 'GET',
                url: `${baseUrl}/users/1`,
                headers: { Authorization: `Bearer ${authToken}` },
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('username');
            });
        });
    });

    // ── 7.4 API Key in Header ───────────────────────────────────────────────────

    it('authenticates with an API key in a custom header', () => {
        const apiKey: string = Cypress.env('apiKey');

        cy.request({
            method: 'GET',
            url: `${baseUrl}/posts/1`,
            headers: { 'x-api-key': apiKey },
        })
            .its('status')
            .should('eq', 200);
    });

    // ── 7.5 API Key as query param ──────────────────────────────────────────────

    it('authenticates with an API key as a query parameter', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/posts/1`,
            qs: { api_key: Cypress.env('apiKey') as string },
        })
            .its('status')
            .should('eq', 200);
    });

    // ── 7.6 Cookie-based Auth ───────────────────────────────────────────────────

    it('demonstrates cookie-based auth pattern', () => {
        // Note: JSONPlaceholder doesn't support session cookies.
        // This demonstrates the pattern for real APIs.
        cy.request({
            method: 'POST',
            url: `${baseUrl}/posts`,
            body: { title: 'session-test', body: 'cookie auth demo', userId: 1 },
        }).then((response) => {
            expect(response.status).to.eq(201);
            // In a real API: expect(response.headers['set-cookie']).to.exist;
            // Cypress preserves cookies for all subsequent requests
        });

        cy.request(`${baseUrl}/posts/1`).its('status').should('eq', 200);
    });

    // ── 7.7 OAuth 2.0 Client Credentials (pattern demo) ─────────────────────────

    it('demonstrates OAuth 2.0 client credentials grant pattern', () => {
        // Note: This is a pattern demonstration.
        // Replace the URL and credentials with your real OAuth provider.
        cy.request<OAuthTokenResponse>({
            method: 'POST',
            url: `${baseUrl}/posts`, // Simulated — replace with real OAuth endpoint
            body: {
                grant_type: 'client_credentials',
                client_id: 'demo-client-id',
                client_secret: 'demo-client-secret',
                scope: 'read:users',
            },
            failOnStatusCode: false,
        }).then((response) => {
            // In a real OAuth flow:
            // expect(response.status).to.eq(200);
            // expect(response.body).to.have.property('access_token');
            // expect(response.body.token_type).to.eq('Bearer');
            cy.log('OAuth 2.0 pattern demonstrated');
        });
    });
});
