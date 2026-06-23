import type { User } from '../../types/api.types';

describe('User API with typed custom commands', { tags: '@api' }, () => {
    // Note: cy.login() requires a real auth endpoint.
    // For JSONPlaceholder, we skip the login and demonstrate the pattern.
    // Uncomment the before() hook when using a real auth API.
    // before(() => cy.login());

    it('gets a user profile using apiGet', () => {
        cy.apiGet('/users/1').then(({ status, body }) => {
            expect(status).to.eq(200);
            expect(body as User).to.have.property('username');
            expect(body as User).to.have.property('email');
        });
    });

    it('creates a new post using apiPost', () => {
        cy.apiPost('/posts', { title: 'Hello', body: 'World', userId: 1 })
            .its('status')
            .should('eq', 201);
    });

    it('updates a post using apiPatch', () => {
        cy.apiPatch('/posts/1', { title: 'Updated via custom command' })
            .its('status')
            .should('eq', 200);
    });

    it('replaces a post using apiPut', () => {
        cy.apiPut('/posts/1', {
            id: 1,
            title: 'Replaced via custom command',
            body: 'Full replacement',
            userId: 1,
        })
            .its('status')
            .should('eq', 200);
    });

    it('deletes a post using apiDelete', () => {
        cy.apiDelete('/posts/1').its('status').should('be.oneOf', [200, 204]);
    });

    it('chains multiple custom commands', () => {
        // Create
        cy.apiPost('/posts', { title: 'Chain Test', body: 'content', userId: 1 }).then(
            ({ status, body }) => {
                expect(status).to.eq(201);
                const createdId = (body as { id: number }).id;
                cy.log(`Created post with ID: ${createdId}`);

                // Update
                cy.apiPatch(`/posts/${createdId}`, { title: 'Updated Chain' }).then(
                    ({ status: patchStatus }) => {
                        expect(patchStatus).to.eq(200);
                    },
                );
            },
        );
    });
});
