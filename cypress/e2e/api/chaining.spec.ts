import type { Post, Comment } from '../../types/api.types';

describe('Chaining Requests', { tags: '@api' }, () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';

    it('creates a resource, then GETs it', () => {
        cy.request<Post>('POST', `${baseUrl}/posts`, {
            title: 'Chain Test',
            body: 'x',
            userId: 1,
        }).then(({ body: created }) => {
            cy.request<Post>(`${baseUrl}/posts/${created.id}`).then(({ body: fetched }) => {
                expect(fetched.id).to.eq(created.id);
                expect(fetched.title).to.eq('Chain Test');
            });
        });
    });

    describe('Full CRUD lifecycle', () => {
        let resourceId: number;

        it('C — creates a resource', () => {
            cy.request<Post>('POST', `${baseUrl}/posts`, {
                title: 'CRUD Test',
                body: 'text',
                userId: 1,
            }).then(({ status, body }) => {
                expect(status).to.eq(201);
                resourceId = body.id;
            });
        });

        it('R — reads the resource', () => {
            cy.request<Post>(`${baseUrl}/posts/${resourceId}`).then(({ status, body }) => {
                expect(status).to.eq(200);
                expect(body.title).to.eq('CRUD Test');
            });
        });

        it('U — updates the resource', () => {
            cy.request<Post>({
                method: 'PATCH',
                url: `${baseUrl}/posts/${resourceId}`,
                body: { title: 'Updated' },
            }).then(({ status }) => expect(status).to.eq(200));
        });

        it('D — deletes the resource', () => {
            cy.request({ method: 'DELETE', url: `${baseUrl}/posts/${resourceId}` }).then(
                ({ status }) => expect(status).to.be.oneOf([200, 204]),
            );
        });
    });

    it('follows a resource chain: user → posts → comments', () => {
        cy.request<{ id: number }>(`${baseUrl}/users/1`).then(({ body: user }) => {
            cy.request<Post[]>(`${baseUrl}/posts?userId=${user.id}`).then(({ body: posts }) => {
                expect(posts).to.be.an('array').and.to.have.length.greaterThan(0);
                const firstPost = posts[0];

                cy.request<Comment[]>(`${baseUrl}/comments?postId=${firstPost.id}`).then(
                    ({ body: comments }) => {
                        expect(comments).to.be.an('array');
                        comments.forEach((c: Comment) => {
                            expect(c.postId).to.eq(firstPost.id);
                        });
                    },
                );
            });
        });
    });

    it('creates a post and then adds a comment (simulated)', () => {
        cy.request<Post>('POST', `${baseUrl}/posts`, {
            title: 'Post for Comment',
            body: 'Will add comments',
            userId: 1,
        }).then(({ body: post }) => {
            cy.request({
                method: 'POST',
                url: `${baseUrl}/comments`,
                body: {
                    postId: post.id,
                    name: 'Test Comment',
                    email: 'test@example.com',
                    body: 'Great post!',
                },
            }).then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('postId', post.id);
            });
        });
    });
});
