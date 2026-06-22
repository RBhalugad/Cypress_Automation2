import { faker } from '@faker-js/faker';

// ── Constants ──────────────────────────────────────────────────────────────
const BASE_URL = 'https://demoqa.com/Account/v1';

// ── Password helper (meets DemoQA policy) ─────────────────────────────────
const generatePassword = (): string =>
    `${faker.string.alpha({ casing: 'upper', length: 2 })}` +
    `${faker.string.alpha({ casing: 'lower', length: 2 })}` +
    `${faker.string.numeric(2)}@!`;

// ──────────────────────────────────────────────────────────────────────────
describe('API Tests for User Endpoints', () => {
    let userId: string;
    let token: string;
    const username = faker.internet.email();
    const password = generatePassword();
    const userPayload = { userName: username, password };

    // ── POST /User - Create a new user ───────────────────────────────────
    it('POST /User - Create User', () => {
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/User`,
            body: userPayload,
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('userID').and.to.be.a('string').and.to.not.be
                .empty;
            expect(response.body).to.have.property('username', username);
            expect(response.body).to.have.property('books').and.to.be.an('array').and.to.be.empty;

            userId = response.body.userID;
            cy.log('Extracted User ID: ' + userId);
        });
    });

    // ── POST /User - Duplicate user (negative test) ──────────────────────
    it('POST /User - Should fail for duplicate username (406)', () => {
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/User`,
            body: userPayload,
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(406);
            expect(response.body).to.have.property('code', '1204');
            expect(response.body).to.have.property('message', 'User exists!');
            cy.log('✅ Duplicate user correctly rejected');
        });
    });

    // ── POST /Authorized - Authorize user ────────────────────────────────
    it('POST /Authorized - Authorize User', () => {
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/Authorized`,
            body: userPayload,
        }).then((response) => {
            expect(response.status).to.eq(200);
            cy.log('User Authorized: ' + response.body);
        });
    });

    // ── POST /Authorized - Wrong password (negative test) ────────────────
    it('POST /Authorized - Should return false for wrong password', () => {
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/Authorized`,
            body: { userName: username, password: 'WrongPass1!' },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(404);
            expect(response.body).to.have.property('code', '1207');
            expect(response.body).to.have.property('message', 'User not found!');
            cy.log('✅ Wrong password correctly rejected');
        });
    });

    // ── POST /GenerateToken - Generate auth token ────────────────────────
    it('POST /GenerateToken - Generate Token', () => {
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/GenerateToken`,
            body: userPayload,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('token').and.to.be.a('string').and.to.not.be
                .empty;
            expect(response.body).to.have.property('expires').and.to.be.a('string').and.to.not.be
                .empty;
            expect(response.body).to.have.property('status', 'Success');
            expect(response.body).to.have.property('result', 'User authorized successfully.');

            token = response.body.token;
            cy.log('Generated Token: ' + token);
        });
    });

    // ── GET /User/{UUID} - Get user details ──────────────────────────────
    it('GET /User/{UUID} - Get User', () => {
        cy.request({
            method: 'GET',
            url: `${BASE_URL}/User/${userId}`,
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('userId', userId);
            expect(response.body).to.have.property('username', username);
            expect(response.body).to.have.property('books').and.to.be.an('array');
        });
    });

    // ── GET /User/{UUID} - Without token (negative test) ─────────────────
    it('GET /User/{UUID} - Should fail without auth token (401)', () => {
        cy.request({
            method: 'GET',
            url: `${BASE_URL}/User/${userId}`,
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(401);
            expect(response.body).to.have.property('code', '1200');
            expect(response.body).to.have.property('message', 'User not authorized!');
            cy.log('✅ Unauthenticated request correctly rejected');
        });
    });

    // ── DELETE /User/{UUID} - Delete user ────────────────────────────────
    it('DELETE /User/{UUID} - Delete User', () => {
        cy.request({
            method: 'DELETE',
            url: `${BASE_URL}/User/${userId}`,
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            expect(response.status).to.eq(204);
            cy.log(`✅ Deleted user: ${userId}`);
        });
    });

    // ── GET /User/{UUID} - Verify deleted user is gone (negative test) ───
    it('GET /User/{UUID} - Should fail for deleted user (401)', () => {
        cy.request({
            method: 'GET',
            url: `${BASE_URL}/User/${userId}`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(401);
            expect(response.body).to.have.property('code', '1207');
            expect(response.body).to.have.property('message', 'User not found!');
            cy.log('✅ Deleted user correctly not found');
        });
    });
});
