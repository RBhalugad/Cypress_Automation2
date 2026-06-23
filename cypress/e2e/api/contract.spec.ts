import Ajv from 'ajv';
import type { Post } from '../../types/api.types';

const ajv = new Ajv();

// ── JSON Schema for Post ──────────────────────────────────────────────────────
// Note: Using a plain schema object instead of JSONSchemaType<T> because
// this project has strictNullChecks disabled in tsconfig.json.

const postSchema = {
    type: 'object' as const,
    required: ['id', 'userId', 'title', 'body'],
    properties: {
        id: { type: 'number' as const },
        userId: { type: 'number' as const },
        title: { type: 'string' as const, minLength: 1 },
        body: { type: 'string' as const },
    },
    additionalProperties: false,
};

const validatePost = ajv.compile<Post>(postSchema);

// Strict schema — no additional properties allowed
const strictSchema = {
    type: 'object' as const,
    required: ['id', 'userId', 'title', 'body'],
    properties: {
        id: { type: 'number' as const },
        userId: { type: 'number' as const },
        title: { type: 'string' as const, minLength: 1 },
        body: { type: 'string' as const },
    },
    additionalProperties: false,
};

const strictValidate = ajv.compile<Post>(strictSchema);

// ─────────────────────────────────────────────────────────────────────────────

describe('Contract Testing', { tags: '@api' }, () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';

    it('validates a single post matches the contract schema', () => {
        cy.request<Post>(`${baseUrl}/posts/1`).then(({ body }) => {
            const valid = validatePost(body);

            if (!valid) {
                cy.log('Schema errors: ' + JSON.stringify(validatePost.errors, null, 2));
            }

            expect(valid, 'Response should match Post schema').to.be.true;
        });
    });

    it('validates every item in a list response (first 10)', () => {
        cy.request<Post[]>(`${baseUrl}/posts`).then(({ body }) => {
            body.slice(0, 10).forEach((post, index) => {
                const valid = validatePost(post);
                expect(valid, `Post at index ${index} should match schema`).to.be.true;
            });
            cy.log('✅ All 10 posts match the contract schema');
        });
    });

    it('detects schema drift — response has unexpected extra fields', () => {
        cy.request<Post>(`${baseUrl}/posts/1`).then(({ body }) => {
            const valid = strictValidate(body);
            expect(valid, 'No unexpected fields in response').to.be.true;
        });
    });

    it('validates required fields are not null or undefined', () => {
        cy.request<Post>(`${baseUrl}/posts/1`).then(({ body }) => {
            expect(body.id).to.not.be.null;
            expect(body.id).to.not.be.undefined;
            expect(body.userId).to.not.be.null;
            expect(body.userId).to.not.be.undefined;
            expect(body.title).to.not.be.null;
            expect(body.title).to.not.be.undefined;
            expect(body.body).to.not.be.null;
            expect(body.body).to.not.be.undefined;
        });
    });

    it('validates field types are correct', () => {
        cy.request<Post>(`${baseUrl}/posts/1`).then(({ body }) => {
            expect(body.id).to.be.a('number');
            expect(body.userId).to.be.a('number');
            expect(body.title).to.be.a('string');
            expect(body.body).to.be.a('string');
        });
    });

    it('validates title has minimum length', () => {
        cy.request<Post>(`${baseUrl}/posts/1`).then(({ body }) => {
            expect(body.title.length).to.be.greaterThan(0);
            cy.log(`Title length: ${body.title.length} characters`);
        });
    });

    it('validates all posts in full list conform to schema', () => {
        cy.request<Post[]>(`${baseUrl}/posts`).then(({ body }) => {
            let failCount = 0;

            body.forEach((post, index) => {
                const valid = validatePost(post);
                if (!valid) {
                    failCount++;
                    cy.log(
                        `❌ Post at index ${index} failed schema: ${JSON.stringify(validatePost.errors)}`,
                    );
                }
            });

            expect(failCount, `${failCount} posts failed schema validation`).to.eq(0);
            cy.log(`✅ All ${body.length} posts passed contract validation`);
        });
    });
});
