import type { Post } from '../../types/api.types';

describe('Pagination', { tags: '@api' }, () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';

    it('fetches the first page', () => {
        cy.request<Post[]>({ url: `${baseUrl}/posts`, qs: { _page: 1, _limit: 10 } }).then(
            ({ body, headers }) => {
                expect(body).to.have.length(10);
                expect(headers).to.have.property('x-total-count');
                cy.log(`Total count: ${headers['x-total-count']}`);
            },
        );
    });

    it('fetches the second page with different data', () => {
        cy.request<Post[]>({ url: `${baseUrl}/posts`, qs: { _page: 2, _limit: 10 } }).then(
            ({ body }) => {
                expect(body).to.have.length(10);
                // Second page starts at id 11
                expect(body[0].id).to.eq(11);
            },
        );
    });

    it('verifies no ID overlap between consecutive pages', () => {
        let page1Ids: number[] = [];
        let page2Ids: number[] = [];

        cy.request<Post[]>({ url: `${baseUrl}/posts`, qs: { _page: 1, _limit: 10 } }).then(
            ({ body }) => {
                page1Ids = body.map((p) => p.id);
            },
        );

        cy.request<Post[]>({ url: `${baseUrl}/posts`, qs: { _page: 2, _limit: 10 } }).then(
            ({ body }) => {
                page2Ids = body.map((p) => p.id);
                const overlap = page1Ids.filter((id) => page2Ids.includes(id));
                expect(overlap).to.have.length(0);
                cy.log('✅ No overlap between page 1 and page 2');
            },
        );
    });

    it('returns fewer items on the last page', () => {
        // JSONPlaceholder has 100 posts
        cy.request<Post[]>({ url: `${baseUrl}/posts`, qs: { _page: 5, _limit: 30 } }).then(
            ({ body }) => {
                // Page 5 with limit 30: items 121-150, but only 100 exist
                expect(body.length).to.be.lte(30);
            },
        );
    });

    it('traverses all pages until empty', () => {
        let allItems: Post[] = [];
        let page = 1;

        function fetchPage(): Cypress.Chainable<void> {
            return cy
                .request<Post[]>({ url: `${baseUrl}/posts`, qs: { _page: page, _limit: 20 } })
                .then(({ body }) => {
                    if (body.length === 0) return;
                    allItems = [...allItems, ...body];
                    page++;
                    return fetchPage();
                });
        }

        fetchPage().then(() => {
            cy.log(`Total items fetched across all pages: ${allItems.length}`);
            expect(allItems.length).to.be.greaterThan(0);
            // JSONPlaceholder has exactly 100 posts
            expect(allItems.length).to.eq(100);
        });
    });

    it('validates page limit works correctly', () => {
        const limits = [5, 10, 25];

        limits.forEach((limit) => {
            cy.request<Post[]>({
                url: `${baseUrl}/posts`,
                qs: { _page: 1, _limit: limit },
            }).then(({ body }) => {
                expect(body.length).to.eq(limit);
                cy.log(`✅ Limit ${limit}: returned ${body.length} items`);
            });
        });
    });
});
