import type { Job } from '../../types/api.types';

describe('Retry Logic & Flaky Requests', { tags: '@api' }, () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';

    // ── Manual polling ────────────────────────────────────────────────────────────

    function pollUntilComplete(url: string, maxRetries = 10): Cypress.Chainable<unknown> {
        return cy.request({ url, failOnStatusCode: false }).then(({ body, status }) => {
            if (status === 200) return cy.wrap(body);
            if (maxRetries === 0) throw new Error(`Request to ${url} did not succeed in time`);
            cy.wait(1000);
            return pollUntilComplete(url, maxRetries - 1);
        });
    }

    it('polls a resource until it returns 200', () => {
        // Using a known-good endpoint to demonstrate the polling pattern
        pollUntilComplete(`${baseUrl}/posts/1`).then((body) => {
            expect(body).to.have.property('id', 1);
            cy.log('✅ Polling completed successfully');
        });
    });

    // ── Exponential backoff ───────────────────────────────────────────────────────

    function requestWithRetry(
        options: Partial<Cypress.RequestOptions>,
        retries = 3,
        delay = 1000,
    ): Cypress.Chainable<Cypress.Response<unknown>> {
        return cy.request({ ...options, failOnStatusCode: false }).then((response) => {
            if (response.status === 200 || response.status === 201) return cy.wrap(response);
            if (retries === 0) throw new Error(`Request failed after retries: ${response.status}`);
            cy.wait(delay);
            return requestWithRetry(options, retries - 1, delay * 2);
        });
    }

    it('retries with exponential backoff until success', () => {
        requestWithRetry({ method: 'GET', url: `${baseUrl}/posts/1` }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('id');
            cy.log('✅ Request succeeded with retry logic');
        });
    });

    // ── Retry on specific status codes ─────────────────────────────────────────────

    function retryOnStatus(
        options: Partial<Cypress.RequestOptions>,
        retryStatuses: number[],
        maxRetries = 3,
    ): Cypress.Chainable<Cypress.Response<unknown>> {
        return cy.request({ ...options, failOnStatusCode: false }).then((response) => {
            if (!retryStatuses.includes(response.status)) return cy.wrap(response);
            if (maxRetries === 0) return cy.wrap(response);
            cy.wait(500);
            return retryOnStatus(options, retryStatuses, maxRetries - 1);
        });
    }

    it('retries only on 429 and 503 status codes', () => {
        retryOnStatus({ method: 'GET', url: `${baseUrl}/posts/1` }, [429, 503]).then((response) => {
            expect(response.status).to.eq(200);
            cy.log('✅ Selective retry completed');
        });
    });

    // ── Job polling pattern (async operations) ────────────────────────────────────

    it('demonstrates async job polling pattern', () => {
        // Pattern: POST to create a job, then poll until complete
        cy.request<{ id: number }>({
            method: 'POST',
            url: `${baseUrl}/posts`,
            body: { title: 'Async Job', body: 'Processing...', userId: 1 },
        }).then(({ body: job }) => {
            cy.log(`Job created with ID: ${job.id}`);

            // Simulate polling by fetching the created resource
            pollUntilComplete(`${baseUrl}/posts/${job.id}`).then((result: unknown) => {
                expect(result).to.have.property('id');
                cy.log('✅ Async job polling pattern demonstrated');
            });
        });
    });
});
