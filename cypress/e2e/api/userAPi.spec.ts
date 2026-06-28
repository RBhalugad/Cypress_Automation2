import { faker } from '@faker-js/faker';
import { GenerateTokenResponse, UserResponse } from '../../types/api.types';

const BASE_URL = 'https://demoqa.com/Account/v1';

const generatePassword = (): string =>
    `${faker.string.alpha({ casing: 'upper', length: 2 })}` +
    `${faker.string.alpha({ casing: 'lower', length: 2 })}` +
    `${faker.string.numeric(2)}@!`;

describe('API Tests for User Endpoints', () => {
    let userId: string;
    let token: string;
    const username = faker.internet.email();
    const password = generatePassword();
    const userPayload = { userName: username, password };

    it('POST /User - Create User', () => {
        cy.request<UserResponse>({
            method: 'POST',
            url: `${BASE_URL}/User`,
            body: userPayload,
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('userID').and.to.be.a('string').and.to.not.be
                .empty;
            expect(response.body).to.have.property('username', username);
            expect(response.body).to.have.property('books').and.to.be.an('array').and.to.be.empty;

            userId = response.body.userID as string;
        });
    });

    it('POST /GenerateToken - Generate Token', () => {
        cy.request<GenerateTokenResponse>({
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
        });
    });

    it('POST /Authorized - Authorize User', () => {
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/Authorized`,
            body: userPayload,
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.true;
        });
    });

    it('GET /User/{UUID} - Get User', () => {
        cy.request<UserResponse>({
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

    it('DELETE /User/{UUID} - Delete User', () => {
        cy.request({
            method: 'DELETE',
            url: `${BASE_URL}/User/${userId}`,
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            expect(response.status).to.eq(204);
        });
    });
});
