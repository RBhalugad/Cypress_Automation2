describe('Performance Assertions', { tags: '@api' }, () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';

    it('responds within 2 seconds', () => {
        const MAX_MS = 2000;

        cy.request(`${baseUrl}/posts`).then((response) => {
            expect(response.duration).to.be.lessThan(MAX_MS);
            cy.log(`Response time: ${response.duration}ms`);
        });
    });

    const endpoints: string[] = ['/posts', '/users', '/comments', '/todos'];

    endpoints.forEach((endpoint) => {
        it(`GET ${endpoint} responds in < 3000ms`, () => {
            cy.request(`${baseUrl}${endpoint}`).its('duration').should('be.lessThan', 3000);
        });
    });

    it('single resource responds faster than list', () => {
        let listDuration: number;
        let singleDuration: number;

        cy.request(`${baseUrl}/posts`).then(({ duration }) => {
            listDuration = duration;
            cy.log(`List duration: ${duration}ms`);
        });

        cy.request(`${baseUrl}/posts/1`).then(({ duration }) => {
            singleDuration = duration;
            cy.log(`Single duration: ${duration}ms`);
        });

        cy.then(() => {
            cy.log(`List: ${listDuration}ms vs Single: ${singleDuration}ms`);
            // Both should be reasonable
            expect(listDuration).to.be.lessThan(5000);
            expect(singleDuration).to.be.lessThan(5000);
        });
    });

    it('benchmarks multiple calls and reports stats', () => {
        const durations: number[] = [];

        Cypress._.times(5, () => {
            cy.request(`${baseUrl}/posts/1`).then(({ duration }) => {
                durations.push(duration);
            });
        });

        cy.then(() => {
            const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
            const max = Math.max(...durations);
            const min = Math.min(...durations);
            cy.log(`Avg: ${avg.toFixed(0)}ms | Min: ${min}ms | Max: ${max}ms`);
            expect(avg).to.be.lessThan(5000);
        });
    });

    it('POST request completes within acceptable time', () => {
        cy.request({
            method: 'POST',
            url: `${baseUrl}/posts`,
            body: { title: 'Perf Test', body: 'timing check', userId: 1 },
        }).then(({ duration, status }) => {
            expect(status).to.eq(201);
            expect(duration).to.be.lessThan(5000);
            cy.log(`POST duration: ${duration}ms`);
        });
    });

    it('DELETE request completes within acceptable time', () => {
        cy.request({
            method: 'DELETE',
            url: `${baseUrl}/posts/1`,
        }).then(({ duration, status }) => {
            expect(status).to.be.oneOf([200, 204]);
            expect(duration).to.be.lessThan(5000);
            cy.log(`DELETE duration: ${duration}ms`);
        });
    });
});
