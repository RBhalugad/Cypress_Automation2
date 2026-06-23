import type { Post } from '../../types/api.types';

describe('Query Parameters & Path Variables', { tags: '@api' }, () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';

    it('filters posts by userId using qs', () => {
        const userId = 1;

        cy.request<Post[]>({
            method: 'GET',
            url: `${baseUrl}/posts`,
            qs: { userId },
        }).then((response) => {
            expect(response.status).to.eq(200);
            response.body.forEach((post: Post) => {
                expect(post.userId).to.eq(userId);
            });
        });
    });

    it('passes multiple query parameters at once', () => {
        interface SearchParams {
            _page: number;
            _limit: number;
            userId: number;
        }

        const params: SearchParams = {
            _page: 1,
            _limit: 5,
            userId: 1,
        };

        cy.request<Post[]>({ method: 'GET', url: `${baseUrl}/posts`, qs: params }).then(
            ({ status, body }) => {
                expect(status).to.eq(200);
                expect(body).to.be.an('array');
                expect(body.length).to.be.lte(5);
            },
        );
    });

    it('uses a dynamic path variable', () => {
        const userId: number = 3;

        cy.request<{ id: number; name: string }>(`${baseUrl}/users/${userId}`).then((response) => {
            expect(response.body.id).to.eq(userId);
        });
    });

    it('fetches comments for a specific post using path and query', () => {
        const postId = 1;

        cy.request({
            method: 'GET',
            url: `${baseUrl}/comments`,
            qs: { postId },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
            response.body.forEach((comment: { postId: number }) => {
                expect(comment.postId).to.eq(postId);
            });
        });
    });
});
