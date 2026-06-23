// cypress/support/index.d.ts

declare namespace Cypress {
    interface Chainable {
        // ── Existing UI Commands ──────────────────────────────────────────────
        SubmitFormDetails(): Chainable<void>;
        getIframeBody(iframeSelector: string): Chainable<JQuery<HTMLBodyElement>>;

        // ── API Commands ──────────────────────────────────────────────────────

        /**
         * Logs in via the API and stores the token in Cypress.env('authToken').
         * @param username - defaults to 'admin'
         * @param password - defaults to 'password'
         */
        login(username?: string, password?: string): Chainable<void>;

        /** Authenticated GET request */
        apiGet(endpoint: string, options?: Partial<RequestOptions>): Chainable<Response<unknown>>;

        /** Authenticated POST request */
        apiPost(
            endpoint: string,
            body: Cypress.RequestBody,
            options?: Partial<RequestOptions>,
        ): Chainable<Response<unknown>>;

        /** Authenticated PUT request */
        apiPut(
            endpoint: string,
            body: Cypress.RequestBody,
            options?: Partial<RequestOptions>,
        ): Chainable<Response<unknown>>;

        /** Authenticated PATCH request */
        apiPatch(
            endpoint: string,
            body: Cypress.RequestBody,
            options?: Partial<RequestOptions>,
        ): Chainable<Response<unknown>>;

        /** Authenticated DELETE request (failOnStatusCode: false by default) */
        apiDelete(
            endpoint: string,
            options?: Partial<RequestOptions>,
        ): Chainable<Response<unknown>>;
    }
}
