import type { Post, User } from '../../types/api.types';

describe('GET /posts', { tags: '@api' }, () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';

    it('returns a list of posts', { tags: ['@api', '@smoke'] }, () => {
        cy.request<Post[]>('GET', `${baseUrl}/posts`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
            expect(response.body.length).to.be.greaterThan(0);
        });
    });

    it('returns a single post by ID', () => {
        cy.request<Post>(`${baseUrl}/posts/1`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('id', 1);
            expect(response.body).to.have.property('title');
            expect(response.body).to.have.property('userId');
        });
    });

    it('shorthand GET — asserts a property via its()', () => {
        cy.request<User>(`${baseUrl}/users/1`).its('body').should('have.property', 'email');
    });

    it('returns posts for a specific user', () => {
        const userId = 1;
        cy.request<Post[]>({ url: `${baseUrl}/posts`, qs: { userId } }).then(({ body }) => {
            body.forEach((post: Post) => {
                expect(post.userId).to.eq(userId);
            });
        });
    });
});
