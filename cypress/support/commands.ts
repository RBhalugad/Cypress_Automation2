// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Type declarations are in cypress/support/index.d.ts

import type { LoginPayload, LoginResponse } from '../types/api.types';

// ── Existing UI Commands ──────────────────────────────────────────────────────

Cypress.Commands.add('SubmitFormDetails', () => {
    cy.get('#country').type('Ind');
    cy.get('.suggestions ul li a').eq(0).click({ force: true });
    cy.get('#checkbox2').check({ force: true }).should('be.checked');
    cy.get('.ng-untouched > .btn').click();
});

Cypress.Commands.add('getIframeBody', (iframeSelector: string) => {
    cy.get(iframeSelector).its('0.contentDocument.body').should('not.be.empty').then(cy.wrap);
});

// ── API Commands ──────────────────────────────────────────────────────────────

const API_URL: string = (Cypress.env('apiUrl') as string) || 'https://jsonplaceholder.typicode.com';

const getAuthHeader = (): Record<string, string> => ({
    Authorization: `Bearer ${Cypress.env('authToken') as string}`,
});

Cypress.Commands.add('login', (username = 'admin', password = 'password') => {
    const payload: LoginPayload = { username, password };

    cy.request<LoginResponse>({
        method: 'POST',
        url: `${API_URL}/auth/login`,
        body: payload,
    }).then(({ body }) => {
        Cypress.env('authToken', body.token);
    });
});

Cypress.Commands.add('apiGet', (endpoint: string, options = {}) => {
    return cy.request({
        method: 'GET',
        url: `${API_URL}${endpoint}`,
        headers: getAuthHeader(),
        ...options,
    });
});

Cypress.Commands.add('apiPost', (endpoint: string, body: Cypress.RequestBody, options = {}) => {
    return cy.request({
        method: 'POST',
        url: `${API_URL}${endpoint}`,
        headers: getAuthHeader(),
        body,
        ...options,
    });
});

Cypress.Commands.add('apiPut', (endpoint: string, body: Cypress.RequestBody, options = {}) => {
    return cy.request({
        method: 'PUT',
        url: `${API_URL}${endpoint}`,
        headers: getAuthHeader(),
        body,
        ...options,
    });
});

Cypress.Commands.add('apiPatch', (endpoint: string, body: Cypress.RequestBody, options = {}) => {
    return cy.request({
        method: 'PATCH',
        url: `${API_URL}${endpoint}`,
        headers: getAuthHeader(),
        body,
        ...options,
    });
});

Cypress.Commands.add('apiDelete', (endpoint: string, options = {}) => {
    return cy.request({
        method: 'DELETE',
        url: `${API_URL}${endpoint}`,
        headers: getAuthHeader(),
        failOnStatusCode: false,
        ...options,
    });
});
