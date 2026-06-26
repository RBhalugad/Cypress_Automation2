# Cypress API Testing with TypeScript — Complete Tutorial

> All possible scenarios from zero to advanced. Fully typed with interfaces, generics, and declaration merging.

---

## Table of Contents

1. [Setup & Project Structure](#1-setup--project-structure)
2. [Type Definitions](#2-type-definitions)
3. [GET Requests](#3-get-requests)
4. [POST Requests](#4-post-requests)
5. [PUT & PATCH Requests](#5-put--patch-requests)
6. [DELETE Requests](#6-delete-requests)
7. [Authentication Scenarios](#7-authentication-scenarios)
8. [Query Parameters & Path Variables](#8-query-parameters--path-variables)
9. [Request Headers & Content Types](#9-request-headers--content-types)
10. [Response Assertions](#10-response-assertions)
11. [cy.intercept — Mocking & Stubbing](#11-cyintercept--mocking--stubbing)
12. [Fixtures](#12-fixtures)
13. [Custom Commands](#13-custom-commands)
14. [Chaining Requests](#14-chaining-requests)
15. [File Uploads](#15-file-uploads)
16. [GraphQL Testing](#16-graphql-testing)
17. [Pagination Testing](#17-pagination-testing)
18. [Error & Edge Case Scenarios](#18-error--edge-case-scenarios)
19. [Environment Variables & Config](#19-environment-variables--config)
20. [Retry Logic & Flaky Requests](#20-retry-logic--flaky-requests)
21. [Performance Assertions](#21-performance-assertions)
22. [Contract Testing](#22-contract-testing)
23. [CI/CD Integration](#23-cicd-integration)

---

## 1. Setup & Project Structure

### Installation

```bash
mkdir cypress-api-tests && cd cypress-api-tests
npm init -y

# Core dependencies
npm install cypress --save-dev
npm install typescript --save-dev

# Type support
npm install @types/node --save-dev

# Optional helpers
npm install @faker-js/faker --save-dev
npm install ajv --save-dev
npm install @types/ajv --save-dev
```

### Recommended Project Structure

```
cypress/
├── e2e/
│   ├── auth/
│   │   └── auth.cy.ts
│   ├── users/
│   │   └── users.cy.ts
│   └── posts/
│       └── posts.cy.ts
├── fixtures/
│   ├── user.json
│   └── post.json
├── support/
│   ├── commands.ts      ← Custom command implementations
│   ├── e2e.ts           ← Global hooks
│   └── index.d.ts       ← Custom command type declarations
└── types/
    └── api.types.ts     ← Shared API interfaces
cypress.config.ts
tsconfig.json
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "CommonJS",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["cypress", "node"]
  },
  "include": ["cypress/**/*.ts", "cypress.config.ts"],
  "exclude": ["node_modules"]
}
```

### cypress.config.ts

```ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    env: {
      apiUrl: 'https://jsonplaceholder.typicode.com',
      authToken: 'your-token-here',
      apiKey: 'your-api-key',
    },
    requestTimeout: 10_000,
    responseTimeout: 30_000,
    retries: { runMode: 2, openMode: 0 },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
```

---

## 2. Type Definitions

Define all shared API interfaces once in `cypress/types/api.types.ts` and import throughout tests.

```ts
// cypress/types/api.types.ts

// ─── Domain Models ────────────────────────────────────────────────────────────

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface CreatePostPayload {
  title: string;
  body: string;
  userId: number;
}

export interface UpdatePostPayload extends Partial<CreatePostPayload> {
  id?: number;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: Address;
  company: Company;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  expiresIn: number;
  user: Pick<User, 'id' | 'username' | 'email'>;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string;
}

// ─── Generic API Envelope ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

export interface ValidationError {
  errors: Array<{
    field: string;
    message: string;
  }>;
}

// ─── Job / Async ──────────────────────────────────────────────────────────────

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  jobId: string;
  status: JobStatus;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

// ─── GraphQL ──────────────────────────────────────────────────────────────────

export interface GraphQLRequest<V = Record<string, unknown>> {
  query: string;
  variables?: V;
  operationName?: string;
}

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

// ─── Cypress Env Config ───────────────────────────────────────────────────────

export interface EnvConfig {
  apiUrl: string;
  authToken: string;
  apiKey?: string;
}

export interface MultiEnvConfig {
  dev: EnvConfig;
  staging: EnvConfig;
  production: EnvConfig;
}
```

---

## 3. GET Requests

```ts
// cypress/e2e/posts/get.cy.ts
import type { Post, User } from '../../types/api.types';

describe('GET /posts', () => {

  it('returns a list of posts', () => {
    cy.request<Post[]>('GET', '/posts').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
    });
  });

  it('returns a single post by ID', () => {
    cy.request<Post>('/posts/1').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('id', 1);
      expect(response.body).to.have.property('title');
      expect(response.body).to.have.property('userId');
    });
  });

  it('shorthand GET — asserts a property via its()', () => {
    cy.request<User>('/users/1')
      .its('body')
      .should('have.property', 'email');
  });

  it('returns posts for a specific user', () => {
    const userId = 1;
    cy.request<Post[]>({ url: '/posts', qs: { userId } }).then(({ body }) => {
      body.forEach((post: Post) => {
        expect(post.userId).to.eq(userId);
      });
    });
  });

});
```

---

## 4. POST Requests

```ts
// cypress/e2e/posts/post.cy.ts
import { faker } from '@faker-js/faker';
import type { Post, CreatePostPayload, CreateUserPayload } from '../../types/api.types';

describe('POST requests', () => {

  it('creates a new post', () => {
    const payload: CreatePostPayload = {
      title: 'My New Post',
      body: 'Some content here',
      userId: 1,
    };

    cy.request<Post>({
      method: 'POST',
      url: '/posts',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expect(response.body.title).to.eq(payload.title);
      expect(response.body.userId).to.eq(payload.userId);
    });
  });

  it('creates a user with Faker-generated data', () => {
    const payload: CreateUserPayload = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    };

    cy.request<{ id: number } & CreateUserPayload>({
      method: 'POST',
      url: '/users',
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
      url: '/login',
      form: true,   // Content-Type: application/x-www-form-urlencoded
      body: {
        username: 'admin',
        password: 'secret123',
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

});
```

---

## 5. PUT & PATCH Requests

```ts
// cypress/e2e/posts/update.cy.ts
import type { Post, UpdatePostPayload } from '../../types/api.types';

describe('PUT & PATCH requests', () => {

  it('PUT — fully replaces a post', () => {
    const fullReplacement: Required<UpdatePostPayload> & { id: number } = {
      id: 1,
      title: 'Updated Title',
      body: 'Updated body content',
      userId: 1,
    };

    cy.request<Post>({
      method: 'PUT',
      url: '/posts/1',
      body: fullReplacement,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.title).to.eq('Updated Title');
    });
  });

  it('PATCH — partially updates only the title', () => {
    const patch: UpdatePostPayload = { title: 'Patched Title Only' };

    cy.request<Post>({
      method: 'PATCH',
      url: '/posts/1',
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
```

---

## 6. DELETE Requests

```ts
// cypress/e2e/posts/delete.cy.ts

describe('DELETE requests', () => {

  it('deletes a post and receives 200', () => {
    cy.request({
      method: 'DELETE',
      url: '/posts/1',
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 204]);
    });
  });

  it('deletes then verifies the resource is gone (404)', () => {
    cy.request({ method: 'DELETE', url: '/posts/1' });

    cy.request({
      method: 'GET',
      url: '/posts/1',
      failOnStatusCode: false,   // ← required to prevent test throw on 4xx
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

});
```

---

## 7. Authentication Scenarios

```ts
// cypress/e2e/auth/auth.cy.ts
import type {
  LoginPayload,
  LoginResponse,
  OAuthTokenResponse,
} from '../../types/api.types';

describe('Authentication Scenarios', () => {

  // ── 7.1 Basic Auth ──────────────────────────────────────────────────────────

  it('authenticates with Basic Auth', () => {
    cy.request<{ authenticated: boolean; user: string }>({
      method: 'GET',
      url: 'https://httpbin.org/basic-auth/user/pass',
      auth: { username: 'user', password: 'pass' },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.authenticated).to.be.true;
    });
  });

  // ── 7.2 Bearer Token ────────────────────────────────────────────────────────

  it('calls a protected endpoint with a Bearer token', () => {
    const token: string = Cypress.env('authToken');

    cy.request({
      method: 'GET',
      url: '/api/protected-resource',
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  // ── 7.3 Login flow — get token, then use it ─────────────────────────────────

  describe('Token-based Auth flow', () => {
    let authToken: string;

    before(() => {
      const credentials: LoginPayload = {
        username: 'admin',
        password: 'password123',
      };

      cy.request<LoginResponse>({
        method: 'POST',
        url: '/api/auth/login',
        body: credentials,
      }).then((response) => {
        expect(response.status).to.eq(200);
        authToken = response.body.token;
      });
    });

    it('accesses a protected route using the obtained token', () => {
      cy.request({
        method: 'GET',
        url: '/api/user/profile',
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('username', 'admin');
      });
    });
  });

  // ── 7.4 API Key in Header ───────────────────────────────────────────────────

  it('authenticates with an API key in a custom header', () => {
    const apiKey: string = Cypress.env('apiKey');

    cy.request({
      method: 'GET',
      url: '/api/data',
      headers: { 'x-api-key': apiKey },
    }).its('status').should('eq', 200);
  });

  // ── 7.5 API Key as query param ──────────────────────────────────────────────

  it('authenticates with an API key as a query parameter', () => {
    cy.request({
      method: 'GET',
      url: '/api/data',
      qs: { api_key: Cypress.env('apiKey') as string },
    }).its('status').should('eq', 200);
  });

  // ── 7.6 Cookie-based Auth ───────────────────────────────────────────────────

  it('logs in and Cypress automatically forwards the session cookie', () => {
    cy.request({
      method: 'POST',
      url: '/api/session',
      body: { username: 'user', password: 'pass' },
    }).then((response) => {
      expect(response.headers['set-cookie']).to.exist;
      // Cypress preserves cookies for all subsequent requests
    });

    cy.request('/api/dashboard').its('status').should('eq', 200);
  });

  // ── 7.7 OAuth 2.0 Client Credentials ───────────────────────────────────────

  it('obtains an OAuth 2.0 access token via client credentials grant', () => {
    cy.request<OAuthTokenResponse>({
      method: 'POST',
      url: 'https://auth.example.com/oauth/token',
      form: true,
      body: {
        grant_type: 'client_credentials',
        client_id: Cypress.env('clientId') as string,
        client_secret: Cypress.env('clientSecret') as string,
        scope: 'read:users',
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('access_token');
      expect(response.body.token_type).to.eq('Bearer');
      Cypress.env('oauthToken', response.body.access_token);
    });
  });

});
```

---

## 8. Query Parameters & Path Variables

```ts
// cypress/e2e/posts/query.cy.ts
import type { Post } from '../../types/api.types';

describe('Query Parameters & Path Variables', () => {

  it('filters posts by userId using qs', () => {
    const userId = 1;

    cy.request<Post[]>({
      method: 'GET',
      url: '/posts',
      qs: { userId },
    }).then((response) => {
      expect(response.status).to.eq(200);
      response.body.forEach((post: Post) => {
        expect(post.userId).to.eq(userId);
      });
    });
  });

  it('passes multiple query parameters at once', () => {
    interface SearchParams {
      category: string;
      minPrice: number;
      maxPrice: number;
      sort: string;
      order: 'asc' | 'desc';
      page: number;
      limit: number;
    }

    const params: SearchParams = {
      category: 'electronics',
      minPrice: 100,
      maxPrice: 500,
      sort: 'price',
      order: 'asc',
      page: 1,
      limit: 20,
    };

    cy.request({ method: 'GET', url: '/products', qs: params })
      .its('status').should('eq', 200);
  });

  it('uses a dynamic path variable', () => {
    const userId: number = 3;

    cy.request<{ id: number; name: string }>(`/users/${userId}`)
      .then((response) => {
        expect(response.body.id).to.eq(userId);
      });
  });

});
```

---

## 9. Request Headers & Content Types

```ts
// cypress/e2e/headers.cy.ts

describe('Request Headers & Content Types', () => {

  it('sends custom request headers', () => {
    const customHeaders: Record<string, string> = {
      Accept: 'application/json',
      'x-request-id': 'cypress-12345',
      'x-client-version': '2.1.0',
    };

    cy.request({ method: 'GET', url: '/api/data', headers: customHeaders })
      .its('status').should('eq', 200);
  });

  it('sends an XML payload', () => {
    const xmlBody = `
      <user>
        <name>John Doe</name>
        <email>john@example.com</email>
      </user>`.trim();

    cy.request({
      method: 'POST',
      url: '/api/users/xml',
      headers: { 'Content-Type': 'application/xml' },
      body: xmlBody,
    }).its('status').should('eq', 201);
  });

  it('asserts content-type in response headers', () => {
    cy.request('/posts').then((response) => {
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

});
```

---

## 10. Response Assertions

```ts
// cypress/e2e/assertions.cy.ts
import type { Post } from '../../types/api.types';

describe('Response Assertions', () => {

  // ── Status codes ─────────────────────────────────────────────────────────────

  it('validates common HTTP status codes', () => {
    cy.request('/posts/1').its('status').should('eq', 200);

    cy.request({ method: 'POST', url: '/posts', body: { title: 'Test', body: 'x', userId: 1 } })
      .its('status').should('eq', 201);

    cy.request({ method: 'DELETE', url: '/posts/1' })
      .its('status').should('eq', 200);

    cy.request({ method: 'GET', url: '/posts/9999', failOnStatusCode: false })
      .its('status').should('eq', 404);
  });

  // ── Body structure ────────────────────────────────────────────────────────────

  it('deeply validates response body structure', () => {
    cy.request<Post>('/posts/1').then(({ body }) => {
      // Type checks
      expect(body).to.be.an('object');
      expect(body.id).to.be.a('number');
      expect(body.title).to.be.a('string').and.not.be.empty;

      // All required keys present
      expect(body).to.have.all.keys('userId', 'id', 'title', 'body');

      // Specific values
      expect(body.id).to.eq(1);
      expect(body.userId).to.be.within(1, 10);
    });
  });

  // ── Array response ────────────────────────────────────────────────────────────

  it('validates a list response', () => {
    cy.request<Post[]>('/posts').then(({ body }) => {
      expect(body).to.be.an('array').with.length.greaterThan(0);
      // Every item conforms to the shape
      body.slice(0, 5).forEach((post: Post) => {
        expect(post).to.have.all.keys('id', 'userId', 'title', 'body');
        expect(post.id).to.be.a('number');
      });
    });
  });

  // ── Header assertions ─────────────────────────────────────────────────────────

  it('validates response headers', () => {
    cy.request('/posts').then((response) => {
      expect(response.headers).to.have.property('content-type');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // ── Reusable schema helper ────────────────────────────────────────────────────

  function assertPostShape(post: unknown): void {
    expect(post).to.have.all.keys('id', 'userId', 'title', 'body');
  }

  it('validates every post in a list using a helper', () => {
    cy.request<Post[]>('/posts').then(({ body }) => {
      body.forEach(assertPostShape);
    });
  });

});
```

---

## 11. cy.intercept — Mocking & Stubbing

```ts
// cypress/e2e/intercept.cy.ts
import type { Post, User } from '../../types/api.types';

describe('cy.intercept — Mocking & Stubbing', () => {

  // ── Full stub ─────────────────────────────────────────────────────────────────

  it('intercepts and mocks a GET response', () => {
    const mockUsers: Partial<User>[] = [{ id: 1, name: 'Mocked User' }];

    cy.intercept('GET', '/api/users', {
      statusCode: 200,
      body: mockUsers,
    }).as('getUsers');

    cy.visit('/users');
    cy.wait('@getUsers');
    cy.contains('Mocked User').should('be.visible');
  });

  // ── Spy (no mock) ─────────────────────────────────────────────────────────────

  it('spies on a POST request without mocking', () => {
    cy.intercept('POST', '/api/login').as('loginRequest');

    cy.visit('/login');
    cy.get('[name=username]').type('admin');
    cy.get('[name=password]').type('password');
    cy.get('button[type=submit]').click();

    cy.wait('@loginRequest').then(({ request, response }) => {
      expect(request.body.username).to.eq('admin');
      expect(response?.statusCode).to.eq(200);
    });
  });

  // ── Network error simulation ──────────────────────────────────────────────────

  it('simulates a network failure', () => {
    cy.intercept('GET', '/api/products', { forceNetworkError: true }).as('networkFail');

    cy.visit('/products');
    cy.wait('@networkFail');
    cy.contains('Failed to load products').should('be.visible');
  });

  // ── Delayed response ──────────────────────────────────────────────────────────

  it('shows loading spinner during a slow API call', () => {
    cy.intercept('GET', '/api/data', (req) => {
      req.reply((res) => {
        res.setDelay(3000);
        res.send({ statusCode: 200, body: { data: 'loaded' } });
      });
    }).as('slowRequest');

    cy.visit('/dashboard');
    cy.get('.loading-spinner').should('be.visible');
    cy.wait('@slowRequest');
    cy.get('.loading-spinner').should('not.exist');
  });

  // ── Regex URL match ───────────────────────────────────────────────────────────

  it('intercepts requests matching a URL pattern', () => {
    cy.intercept('GET', /\/posts\/\d+/, { fixture: 'post.json' }).as('getPost');

    cy.visit('/posts/1');
    cy.wait('@getPost');
  });

  // ── Modify a real response ─────────────────────────────────────────────────────

  it('intercepts and mutates a real response', () => {
    cy.intercept('GET', '/api/user', (req) => {
      req.reply((res) => {
        // Inject a field that doesn't exist in real API
        (res.body as Record<string, unknown>).isAdmin = true;
        res.send();
      });
    });
  });

  // ── Stub with a fixture file ──────────────────────────────────────────────────

  it('stubs a response from a fixture file', () => {
    cy.intercept('GET', '/api/posts/1', { fixture: 'post.json' }).as('getPost');

    cy.request('/api/posts/1').then(({ body }) => {
      expect(body).to.exist;
    });
  });

});
```

---

## 12. Fixtures

### cypress/fixtures/user.json

```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "admin"
}
```

### cypress/fixtures/post.json

```json
{
  "id": 1,
  "userId": 1,
  "title": "Fixture Post Title",
  "body": "Fixture post body text"
}
```

```ts
// cypress/e2e/fixtures.cy.ts
import type { User, Post } from '../../types/api.types';

describe('Fixtures', () => {

  it('POSTs using data from a fixture', () => {
    cy.fixture<User>('user').then((user) => {
      cy.request<{ id: number }>({
        method: 'POST',
        url: '/api/users',
        body: user,
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
      });
    });
  });

  it('intercepts using a fixture file', () => {
    cy.intercept('GET', '/api/posts/1', { fixture: 'post.json' }).as('stubbedPost');
  });

  // ── Typed fixture helper ──────────────────────────────────────────────────────

  type Role = 'admin' | 'editor' | 'viewer';
  const roles: Role[] = ['admin', 'editor', 'viewer'];

  roles.forEach((role) => {
    it(`creates a ${role} user from a fixture`, () => {
      cy.fixture<User>(`users/${role}`).then((user) => {
        cy.request('POST', '/api/users', user).its('status').should('eq', 201);
      });
    });
  });

});
```

---

## 13. Custom Commands

### cypress/support/commands.ts

```ts
// cypress/support/commands.ts
import type { LoginPayload, LoginResponse } from '../types/api.types';

const API_URL: string = Cypress.env('apiUrl') as string;

const getAuthHeader = (): Record<string, string> => ({
  Authorization: `Bearer ${Cypress.env('authToken') as string}`,
});

// ── Login ─────────────────────────────────────────────────────────────────────

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

// ── Typed API helpers ─────────────────────────────────────────────────────────

Cypress.Commands.add('apiGet', (endpoint: string, options = {}) => {
  return cy.request({
    method: 'GET',
    url: `${API_URL}${endpoint}`,
    headers: getAuthHeader(),
    ...options,
  });
});

Cypress.Commands.add('apiPost', (endpoint: string, body: unknown, options = {}) => {
  return cy.request({
    method: 'POST',
    url: `${API_URL}${endpoint}`,
    headers: getAuthHeader(),
    body,
    ...options,
  });
});

Cypress.Commands.add('apiPut', (endpoint: string, body: unknown, options = {}) => {
  return cy.request({
    method: 'PUT',
    url: `${API_URL}${endpoint}`,
    headers: getAuthHeader(),
    body,
    ...options,
  });
});

Cypress.Commands.add('apiPatch', (endpoint: string, body: unknown, options = {}) => {
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
```

### cypress/support/index.d.ts — Declaration Merging

```ts
// cypress/support/index.d.ts

declare namespace Cypress {
  interface Chainable {
    /**
     * Logs in via the API and stores the token in Cypress.env('authToken').
     * @param username - defaults to 'admin'
     * @param password - defaults to 'password'
     */
    login(username?: string, password?: string): Chainable<void>;

    /** Authenticated GET request */
    apiGet(
      endpoint: string,
      options?: Partial<RequestOptions>
    ): Chainable<Response<unknown>>;

    /** Authenticated POST request */
    apiPost(
      endpoint: string,
      body: unknown,
      options?: Partial<RequestOptions>
    ): Chainable<Response<unknown>>;

    /** Authenticated PUT request */
    apiPut(
      endpoint: string,
      body: unknown,
      options?: Partial<RequestOptions>
    ): Chainable<Response<unknown>>;

    /** Authenticated PATCH request */
    apiPatch(
      endpoint: string,
      body: unknown,
      options?: Partial<RequestOptions>
    ): Chainable<Response<unknown>>;

    /** Authenticated DELETE request (failOnStatusCode: false by default) */
    apiDelete(
      endpoint: string,
      options?: Partial<RequestOptions>
    ): Chainable<Response<unknown>>;
  }
}
```

### Using custom commands in tests

```ts
// cypress/e2e/users/users.cy.ts
import type { User, CreateUserPayload } from '../../types/api.types';

describe('User API with typed custom commands', () => {
  before(() => cy.login());

  it('gets the current user profile', () => {
    cy.apiGet('/users/me').then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body as User).to.have.property('username', 'admin');
    });
  });

  it('creates a new post', () => {
    cy.apiPost('/posts', { title: 'Hello', body: 'World', userId: 1 })
      .its('status').should('eq', 201);
  });

  it('updates a post', () => {
    cy.apiPatch('/posts/1', { title: 'Updated via custom command' })
      .its('status').should('eq', 200);
  });

  it('deletes a post', () => {
    cy.apiDelete('/posts/1').its('status').should('be.oneOf', [200, 204]);
  });
});
```

---

## 14. Chaining Requests

```ts
// cypress/e2e/chaining.cy.ts
import type { Post, Comment } from '../../types/api.types';

describe('Chaining Requests', () => {

  it('creates a resource, then GETs it', () => {
    cy.request<Post>('POST', '/posts', { title: 'Chain Test', body: 'x', userId: 1 })
      .then(({ body: created }) => {
        cy.request<Post>(`/posts/${created.id}`).then(({ body: fetched }) => {
          expect(fetched.id).to.eq(created.id);
          expect(fetched.title).to.eq('Chain Test');
        });
      });
  });

  describe('Full CRUD lifecycle', () => {
    let resourceId: number;

    it('C — creates a resource', () => {
      cy.request<Post>('POST', '/posts', { title: 'CRUD Test', body: 'text', userId: 1 })
        .then(({ status, body }) => {
          expect(status).to.eq(201);
          resourceId = body.id;
        });
    });

    it('R — reads the resource', () => {
      cy.request<Post>(`/posts/${resourceId}`).then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.title).to.eq('CRUD Test');
      });
    });

    it('U — updates the resource', () => {
      cy.request<Post>({ method: 'PATCH', url: `/posts/${resourceId}`, body: { title: 'Updated' } })
        .then(({ status }) => expect(status).to.eq(200));
    });

    it('D — deletes the resource', () => {
      cy.request({ method: 'DELETE', url: `/posts/${resourceId}` })
        .then(({ status }) => expect(status).to.be.oneOf([200, 204]));
    });
  });

  it('follows a resource chain: user → posts → comments', () => {
    cy.request<{ id: number }>('/users/1').then(({ body: user }) => {
      cy.request<Post[]>(`/posts?userId=${user.id}`).then(({ body: posts }) => {
        const firstPost = posts[0];

        cy.request<Comment[]>(`/comments?postId=${firstPost.id}`).then(({ body: comments }) => {
          expect(comments).to.be.an('array');
          comments.forEach((c: Comment) => {
            expect(c.postId).to.eq(firstPost.id);
          });
        });
      });
    });
  });

});
```

---

## 15. File Uploads

```ts
// cypress/e2e/upload.cy.ts

interface UploadResponse {
  fileUrl: string;
  fileName: string;
  size: number;
}

describe('File Uploads', () => {

  it('uploads a file via multipart/form-data', () => {
    cy.fixture<string>('test-image.png', 'base64').then((fileContent) => {
      const blob = Cypress.Blob.base64StringToBlob(fileContent, 'image/png');
      const formData = new FormData();
      formData.append('file', blob, 'test-image.png');
      formData.append('userId', '1');

      cy.request<UploadResponse>({
        method: 'POST',
        url: '/api/upload',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('fileUrl');
        expect(response.body.fileUrl).to.be.a('string');
      });
    });
  });

});
```

---

## 16. GraphQL Testing

```ts
// cypress/e2e/graphql.cy.ts
import type { GraphQLRequest, GraphQLResponse } from '../../types/api.types';

const GQL_URL = '/graphql';

// ── Response types ────────────────────────────────────────────────────────────

interface GqlUser {
  id: string;
  name: string;
  email: string;
}

interface GqlPost {
  id: string;
  title: string;
}

interface GetUsersData { users: GqlUser[] }
interface CreatePostData { createPost: GqlPost }
interface CreatePostVars { title: string; userId: string }

// ─────────────────────────────────────────────────────────────────────────────

describe('GraphQL API', () => {

  it('queries a list of users', () => {
    const payload: GraphQLRequest = {
      query: `
        query GetUsers {
          users { id name email }
        }`,
    };

    cy.request<GraphQLResponse<GetUsersData>>({
      method: 'POST',
      url: GQL_URL,
      body: payload,
      headers: { 'Content-Type': 'application/json' },
    }).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body).not.to.have.property('errors');
      expect(body.data.users).to.be.an('array');
      body.data.users.forEach((u: GqlUser) => {
        expect(u).to.have.all.keys('id', 'name', 'email');
      });
    });
  });

  it('sends a mutation with typed variables', () => {
    const payload: GraphQLRequest<CreatePostVars> = {
      query: `
        mutation CreatePost($title: String!, $userId: ID!) {
          createPost(title: $title, userId: $userId) { id title }
        }`,
      variables: { title: 'GraphQL Post', userId: '1' },
      operationName: 'CreatePost',
    };

    cy.request<GraphQLResponse<CreatePostData>>({
      method: 'POST',
      url: GQL_URL,
      body: payload,
    }).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.data.createPost).to.have.property('id');
      expect(body.data.createPost.title).to.eq('GraphQL Post');
    });
  });

  it('handles GraphQL errors', () => {
    const badPayload: GraphQLRequest = { query: '{ invalidField }' };

    cy.request<GraphQLResponse<never>>({
      method: 'POST',
      url: GQL_URL,
      body: badPayload,
      failOnStatusCode: false,
    }).then(({ body }) => {
      expect(body).to.have.property('errors');
      expect(body.errors![0]).to.have.property('message');
    });
  });

});
```

---

## 17. Pagination Testing

```ts
// cypress/e2e/pagination.cy.ts
import type { Post } from '../../types/api.types';

describe('Pagination', () => {

  it('fetches the first page', () => {
    cy.request<Post[]>({ url: '/posts', qs: { _page: 1, _limit: 10 } })
      .then(({ body, headers }) => {
        expect(body).to.have.length(10);
        expect(headers).to.have.property('x-total-count');
      });
  });

  it('verifies no ID overlap between consecutive pages', () => {
    let page1Ids: number[] = [];
    let page2Ids: number[] = [];

    cy.request<Post[]>({ url: '/posts', qs: { _page: 1, _limit: 10 } })
      .then(({ body }) => { page1Ids = body.map((p) => p.id); });

    cy.request<Post[]>({ url: '/posts', qs: { _page: 2, _limit: 10 } })
      .then(({ body }) => {
        page2Ids = body.map((p) => p.id);
        const overlap = page1Ids.filter((id) => page2Ids.includes(id));
        expect(overlap).to.have.length(0);
      });
  });

  it('traverses all pages until empty', () => {
    let allItems: Post[] = [];
    let page = 1;

    function fetchPage(): Cypress.Chainable<void> {
      return cy.request<Post[]>({ url: '/posts', qs: { _page: page, _limit: 20 } })
        .then(({ body }) => {
          if (body.length === 0) return;
          allItems = [...allItems, ...body];
          page++;
          return fetchPage();
        });
    }

    fetchPage().then(() => {
      cy.log(`Total items fetched: ${allItems.length}`);
      expect(allItems.length).to.be.greaterThan(0);
    });
  });

});
```

---

## 18. Error & Edge Case Scenarios

```ts
// cypress/e2e/errors.cy.ts
import type { ApiError, ValidationError } from '../../types/api.types';

describe('Error & Edge Case Scenarios', () => {

  it('handles 500 server error without failing the test', () => {
    cy.request<ApiError>({
      method: 'GET',
      url: '/api/broken-endpoint',
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.eq(500);
      expect(body).to.have.property('message');
    });
  });

  it('returns 422 for missing required fields', () => {
    cy.request<ValidationError>({
      method: 'POST',
      url: '/api/users',
      body: { name: '' },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.be.oneOf([400, 422]);
      expect(body.errors).to.be.an('array');
      const emailError = body.errors.find((e) => e.field === 'email');
      expect(emailError).to.exist;
    });
  });

  it('returns 401 without an Authorization header', () => {
    cy.request({
      method: 'GET',
      url: '/api/admin',
      failOnStatusCode: false,
    }).its('status').should('eq', 401);
  });

  it('returns 403 for a non-admin user', () => {
    cy.request({
      method: 'DELETE',
      url: '/api/system/reset',
      headers: { Authorization: `Bearer ${Cypress.env('userToken') as string}` },
      failOnStatusCode: false,
    }).its('status').should('eq', 403);
  });

  it('returns 404 for a non-existent resource', () => {
    cy.request({
      method: 'GET',
      url: '/api/posts/999999',
      failOnStatusCode: false,
    }).its('status').should('eq', 404);
  });

  it('returns 4xx for an invalid JSON body', () => {
    cy.request({
      method: 'POST',
      url: '/api/data',
      body: 'not-valid-json',
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).its('status').should('be.within', 400, 422);
  });

  it('returns 409 on duplicate resource creation', () => {
    const user = { email: 'existing@example.com', name: 'Existing' };
    cy.request({ method: 'POST', url: '/api/users', body: user, failOnStatusCode: false });

    cy.request({
      method: 'POST',
      url: '/api/users',
      body: user,
      failOnStatusCode: false,
    }).its('status').should('eq', 409);
  });

});
```

---

## 19. Environment Variables & Config

```ts
// cypress.config.ts
import { defineConfig } from 'cypress';
import dotenvPlugin from 'cypress-dotenv';
import type { MultiEnvConfig } from './cypress/types/api.types';

const envConfigs: MultiEnvConfig = {
  dev: {
    apiUrl: 'https://dev-api.example.com',
    authToken: 'dev-token',
  },
  staging: {
    apiUrl: 'https://staging-api.example.com',
    authToken: 'staging-token',
  },
  production: {
    apiUrl: 'https://api.example.com',
    authToken: 'prod-token',
  },
};

export default defineConfig({
  e2e: {
    env: { ...envConfigs },
    setupNodeEvents(on, config) {
      return dotenvPlugin(config);
    },
  },
});
```

### Accessing typed env config in tests

```ts
// cypress/e2e/env-usage.cy.ts
import type { EnvConfig, MultiEnvConfig } from '../../types/api.types';

type EnvName = keyof MultiEnvConfig;

const envName = (Cypress.env('environment') as EnvName | undefined) ?? 'dev';
const config  = Cypress.env(envName) as EnvConfig;

it('calls the health endpoint for the current environment', () => {
  cy.request({
    url: `${config.apiUrl}/health`,
    headers: { Authorization: `Bearer ${config.authToken}` },
  }).its('status').should('eq', 200);
});
```

### Switching environments at runtime

```bash
npx cypress run --env environment=staging
npx cypress run --env environment=production
```

---

## 20. Retry Logic & Flaky Requests

```ts
// cypress/e2e/retry.cy.ts
import type { Job } from '../../types/api.types';

// ── Manual polling ────────────────────────────────────────────────────────────

function pollUntilComplete(
  jobId: string,
  maxRetries = 10
): Cypress.Chainable<Job> {
  return cy.request<Job>(`/api/jobs/${jobId}`).then(({ body }) => {
    if (body.status === 'completed') return cy.wrap(body);
    if (maxRetries === 0) throw new Error(`Job ${jobId} did not complete in time`);
    cy.wait(2000);
    return pollUntilComplete(jobId, maxRetries - 1);
  });
}

it('polls an async job until completion', () => {
  cy.request<Pick<Job, 'jobId'>>('POST', '/api/jobs', { type: 'export' })
    .then(({ body }) => {
      pollUntilComplete(body.jobId).then((job: Job) => {
        expect(job.status).to.eq('completed');
        expect(job).to.have.property('downloadUrl');
      });
    });
});

// ── Exponential backoff ───────────────────────────────────────────────────────

function requestWithRetry(
  options: Partial<Cypress.RequestOptions>,
  retries = 3,
  delay = 1000
): Cypress.Chainable<Cypress.Response<unknown>> {
  return cy.request({ ...options, failOnStatusCode: false }).then((response) => {
    if (response.status === 200) return cy.wrap(response);
    if (retries === 0) throw new Error(`Request failed after retries: ${response.status}`);
    cy.wait(delay);
    return requestWithRetry(options, retries - 1, delay * 2);
  });
}

it('retries with exponential backoff until success', () => {
  requestWithRetry({ method: 'GET', url: '/api/unstable-endpoint' })
    .its('status').should('eq', 200);
});
```

---

## 21. Performance Assertions

```ts
// cypress/e2e/performance.cy.ts

describe('Performance Assertions', () => {

  it('responds within 2 seconds', () => {
    const MAX_MS = 2000;

    cy.request('/posts').then((response) => {
      expect(response.duration).to.be.lessThan(MAX_MS);
    });
  });

  const endpoints: string[] = ['/posts', '/users', '/comments', '/todos'];

  endpoints.forEach((endpoint) => {
    it(`GET ${endpoint} responds in < 1500ms`, () => {
      cy.request(endpoint).its('duration').should('be.lessThan', 1500);
    });
  });

  it('benchmarks multiple calls and reports stats', () => {
    const durations: number[] = [];

    Cypress._.times(5, () => {
      cy.request('/posts/1').then(({ duration }) => {
        durations.push(duration);
      });
    });

    cy.then(() => {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const max = Math.max(...durations);
      cy.log(`Avg: ${avg.toFixed(0)}ms | Max: ${max}ms`);
      expect(avg).to.be.lessThan(2000);
    });
  });

});
```

---

## 22. Contract Testing

```ts
// cypress/e2e/contract.cy.ts
import Ajv, { JSONSchemaType } from 'ajv';
import type { Post } from '../../types/api.types';

const ajv = new Ajv();

// ── JSON Schema typed with ajv ────────────────────────────────────────────────

const postSchema: JSONSchemaType<Post> = {
  type: 'object',
  required: ['id', 'userId', 'title', 'body'],
  properties: {
    id:     { type: 'number' },
    userId: { type: 'number' },
    title:  { type: 'string', minLength: 1 },
    body:   { type: 'string' },
  },
  additionalProperties: false,
};

const validatePost = ajv.compile<Post>(postSchema);

// ─────────────────────────────────────────────────────────────────────────────

describe('Contract Testing', () => {

  it('validates a single post matches the contract schema', () => {
    cy.request<Post>('/posts/1').then(({ body }) => {
      const valid = validatePost(body);

      if (!valid) {
        cy.log('Schema errors', JSON.stringify(validatePost.errors, null, 2));
      }

      expect(valid, 'Response should match Post schema').to.be.true;
    });
  });

  it('validates every item in a list response', () => {
    cy.request<Post[]>('/posts').then(({ body }) => {
      body.slice(0, 10).forEach((post, index) => {
        const valid = validatePost(post);
        expect(valid, `Post at index ${index} should match schema`).to.be.true;
      });
    });
  });

  it('detects schema drift — response has unexpected extra fields', () => {
    const strictSchema: JSONSchemaType<Post> = { ...postSchema, additionalProperties: false };
    const strictValidate = ajv.compile<Post>(strictSchema);

    cy.request<Post>('/posts/1').then(({ body }) => {
      const valid = strictValidate(body);
      expect(valid, 'No unexpected fields in response').to.be.true;
    });
  });

});
```

---

## 23. CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/cypress-api.yml
name: Cypress API Tests (TypeScript)

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  cypress-api:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type-check
        run: npx tsc --noEmit

      - name: Run Cypress API Tests
        run: npx cypress run --browser electron --headless
        env:
          CYPRESS_authToken: ${{ secrets.AUTH_TOKEN }}
          CYPRESS_apiKey:    ${{ secrets.API_KEY }}
          CYPRESS_baseUrl:   ${{ vars.API_BASE_URL }}

      - name: Upload test artifacts on failure
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: cypress-results
          path: |
            cypress/screenshots
            cypress/videos
```

### npm scripts — package.json

```json
{
  "scripts": {
    "typecheck":          "tsc --noEmit",
    "test:api":           "cypress run --spec 'cypress/e2e/**/*.cy.ts'",
    "test:api:dev":       "cypress run --env environment=dev",
    "test:api:staging":   "cypress run --env environment=staging",
    "test:api:open":      "cypress open",
    "test:api:headed":    "cypress run --headed",
    "test:api:parallel":  "cypress run --record --parallel --key $CYPRESS_RECORD_KEY"
  }
}
```

---

## Quick Reference Cheatsheet

| Scenario | TypeScript Pattern |
|---|---|
| Typed GET | `cy.request<Post>('/path')` |
| Typed POST | `cy.request<Post>({ method: 'POST', url, body })` |
| Skip 4xx/5xx throw | `failOnStatusCode: false` |
| Query params | `qs: { key: value }` |
| Bearer token | `headers: { Authorization: \`Bearer ${token}\` }` |
| Basic auth | `auth: { username, password }` |
| Form data | `form: true, body: {...}` |
| Type env var | `Cypress.env('key') as string` |
| Typed fixture | `cy.fixture<User>('user').then(...)` |
| Mock intercept | `cy.intercept('GET', '/url', { statusCode, body })` |
| Stub with fixture | `cy.intercept('/url', { fixture: 'file.json' })` |
| Assert status | `.its('status').should('eq', 200)` |
| Assert body prop | `.its('body').should('have.property', 'id')` |
| Measure duration | `.its('duration').should('be.lessThan', 2000)` |
| Typed custom cmd | Declare in `index.d.ts`, implement in `commands.ts` |
| GraphQL | `cy.request<GraphQLResponse<T>>({ body: { query, variables } })` |
| Schema validate | `ajv.compile<T>(schema)` with `JSONSchemaType<T>` |
| Retry backoff | Recursive fn returning `Cypress.Chainable<T>` |

---

*Generated for Cypress v13+ with TypeScript 5+. Replace `https://jsonplaceholder.typicode.com` with your own `baseUrl`. Run `npx tsc --noEmit` before each test run to catch type errors early.*
