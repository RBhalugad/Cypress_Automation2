import { faker } from '@faker-js/faker';
import type { Post, CreatePostPayload, CreateUserPayload } from '../../types/api.types';

describe('POST requests', { tags: '@api' }, () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';

    it('creates a new post', { tags: ['@api', '@regression'] }, () => {
        const payload: CreatePostPayload = {
            title: 'My New Post',
            body: 'Some content here',
            userId: 1,
        };

        cy.request<Post>({
            method: 'POST',
            url: `${baseUrl}/posts`,
            body: payload,
            headers: { 'Content-Type': 'application/json' },
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('id');
            expect(response.body.title).to.eq(payload.title);
            expect(response.body.userId).to.eq(payload.userId);
        });
    });

    it('creates a user with Faker-generated data', { tags: ['@api', '@regression'] }, () => {
        const payload: CreateUserPayload = {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
        };

        cy.request<{ id: number } & CreateUserPayload>({
            method: 'POST',
            url: `${baseUrl}/users`,
            body: payload,
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body.email).to.eq(payload.email);
            expect(response.body.id).to.be.a('number');
        });
    });

    it('submits URL-encoded form data', () => {
        cy.request({
            method: 'POST',
            url: `${baseUrl}/posts`,
            form: true, // Content-Type: application/x-www-form-urlencoded
            body: {
                title: 'Form Post',
                body: 'Submitted via form encoding',
                userId: 1,
            },
        }).then((response) => {
            expect(response.status).to.eq(201);
        });
    });
});
