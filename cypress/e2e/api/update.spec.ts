import type { Post, UpdatePostPayload } from '../../types/api.types';

describe('PUT & PATCH requests', { tags: '@api' }, () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';

    it('PUT — fully replaces a post', { tags: ['@api', '@regression'] }, () => {
        const fullReplacement: Required<UpdatePostPayload> & { id: number } = {
            id: 1,
            title: 'Updated Title',
            body: 'Updated body content',
            userId: 1,
        };

        cy.request<Post>({
            method: 'PUT',
            url: `${baseUrl}/posts/1`,
            body: fullReplacement,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.title).to.eq('Updated Title');
        });
    });

    it('PATCH — partially updates only the title', { tags: ['@api', '@regression'] }, () => {
        const patch: UpdatePostPayload = { title: 'Patched Title Only' };

        cy.request<Post>({
            method: 'PATCH',
            url: `${baseUrl}/posts/1`,
            body: patch,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.title).to.eq('Patched Title Only');
            // Other fields remain
            expect(response.body).to.have.property('userId');
            expect(response.body).to.have.property('body');
        });
    });
});
