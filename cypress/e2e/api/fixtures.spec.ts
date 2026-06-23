import type { User } from '../../types/api.types';

describe('Fixtures', { tags: '@api' }, () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';

    it('POSTs using data from a fixture', () => {
        cy.fixture<User>('user').then((user) => {
            cy.request<{ id: number }>({
                method: 'POST',
                url: `${baseUrl}/users`,
                body: user,
            }).then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('id');
            });
        });
    });

    it('POSTs using data from the post fixture', () => {
        cy.fixture('post').then((post) => {
            cy.request({
                method: 'POST',
                url: `${baseUrl}/posts`,
                body: post,
            }).then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('id');
                expect(response.body.title).to.eq(post.title);
            });
        });
    });

    it('intercepts using a fixture file', () => {
        cy.intercept('GET', '**/posts/1', { fixture: 'post.json' }).as('stubbedPost');
        cy.log('Fixture-based intercept registered');
    });

    it('loads and validates fixture data structure', () => {
        cy.fixture<User>('user').then((user) => {
            expect(user).to.have.property('id');
            expect(user).to.have.property('name');
            expect(user).to.have.property('email');
            expect(user.email).to.include('@');
        });
    });

    it('uses fixture data with addPlace.json', () => {
        cy.fixture('addPlace').then((payload) => {
            expect(payload).to.have.property('location');
            expect(payload.location).to.have.property('lat');
            expect(payload.location).to.have.property('lng');
            expect(payload).to.have.property('name');
            expect(payload).to.have.property('address');
            cy.log(`Fixture loaded: ${payload.name}`);
        });
    });
});
