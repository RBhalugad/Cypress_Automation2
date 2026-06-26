# Cypress UI Testing — Complete Tutorial

> **All concepts, commands, patterns, and real-world scenarios in one place.**

---

## Table of Contents

1. [Introduction & Architecture](#1-introduction--architecture)
2. [Installation & Project Setup](#2-installation--project-setup)
3. [Configuration](#3-configuration)
4. [Test Structure & Lifecycle Hooks](#4-test-structure--lifecycle-hooks)
5. [Selectors & DOM Traversal](#5-selectors--dom-traversal)
6. [Actions & Interactions](#6-actions--interactions)
7. [Assertions](#7-assertions)
8. [Aliases & Variables](#8-aliases--variables)
9. [Network Interception & Stubbing](#9-network-interception--stubbing)
10. [Navigation Commands](#10-navigation-commands)
11. [Fixtures & Test Data](#11-fixtures--test-data)
12. [Custom Commands](#12-custom-commands)
13. [Screenshots & Videos](#13-screenshots--videos)
14. [Advanced Scenarios](#14-advanced-scenarios)
15. [Page Object Model (POM)](#15-page-object-model-pom)
16. [Authentication Strategies](#16-authentication-strategies)
17. [Component Testing](#17-component-testing)
18. [Plugins & Ecosystem](#18-plugins--ecosystem)
19. [CI/CD Integration](#19-cicd-integration)
20. [Debugging Techniques](#20-debugging-techniques)
21. [Best Practices & Anti-patterns](#21-best-practices--anti-patterns)
22. [Real-World Test Suites](#22-real-world-test-suites)

---

## 1. Introduction & Architecture

### What is Cypress?

Cypress is a modern, JavaScript-based end-to-end testing framework built for the web. Unlike Selenium-based tools that operate outside the browser via WebDriver, **Cypress runs directly inside the browser**, giving it native access to the DOM, network layer, storage, and application code.

### Key Advantages

| Feature | Cypress | Selenium/WebDriver |
|---|---|---|
| Execution model | In-browser | External WebDriver |
| Automatic waits | Yes (built-in retry) | Manual waits needed |
| Time-travel debugging | Yes | No |
| Network control | Built-in `cy.intercept()` | Requires proxy setup |
| Real-time reloads | Yes | No |
| Flakiness | Very low | Higher |
| Language support | JavaScript / TypeScript | Many |

### How Cypress Works

```
┌──────────────────────────────────────────────────────┐
│                    Browser (Chrome/Firefox/Edge)      │
│                                                       │
│  ┌─────────────────┐       ┌──────────────────────┐  │
│  │  Cypress Runner │ ────► │  Your Application    │  │
│  │  (Node.js proxy)│       │  (iframe)            │  │
│  └────────┬────────┘       └──────────────────────┘  │
│           │                                           │
│           ▼                                           │
│  ┌─────────────────┐                                  │
│  │  Test Code      │   Full DOM, Network, Cookie      │
│  │  (runs in same  │   and JS runtime access          │
│  │   browser tab)  │                                  │
│  └─────────────────┘                                  │
└──────────────────────────────────────────────────────┘
```

Cypress uses a **command queue** — commands are not executed immediately but queued and run asynchronously in order.

---

## 2. Installation & Project Setup

### Prerequisites
- Node.js v16+ (v18+ recommended)
- npm or yarn

### Install Cypress

```bash
# New project
mkdir my-app-tests && cd my-app-tests
npm init -y

# Install Cypress
npm install cypress --save-dev

# Open Cypress Launchpad (first-time setup wizard)
npx cypress open
```

### Folder Structure (after first run)

```
my-app-tests/
├── cypress/
│   ├── e2e/                  # Your test files (.cy.js / .cy.ts)
│   │   └── example.cy.js
│   ├── fixtures/             # Static test data (JSON, images)
│   │   └── users.json
│   ├── support/
│   │   ├── commands.js       # Custom commands
│   │   └── e2e.js            # Global hooks / imports
│   └── screenshots/          # Auto-generated on failure
│   └── videos/               # Test recordings
├── cypress.config.js         # Main configuration file
└── package.json
```

### Running Cypress

```bash
# Open interactive GUI
npx cypress open

# Run headlessly (CI mode)
npx cypress run

# Run a specific file
npx cypress run --spec "cypress/e2e/login.cy.js"

# Run in a specific browser
npx cypress run --browser chrome
npx cypress run --browser firefox
npx cypress run --browser edge

# Run with environment variables
npx cypress run --env apiUrl=https://staging.api.com
```

---

## 3. Configuration

### `cypress.config.js` — Full Reference

```js
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  // --- E2E Testing Options ---
  e2e: {
    baseUrl: 'http://localhost:3000',   // Prefix for cy.visit()
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',

    setupNodeEvents(on, config) {
      // Node event listeners (plugins)
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-gpu');
        }
        return launchOptions;
      });
      return config;
    },
  },

  // --- Global Options ---
  viewportWidth: 1280,
  viewportHeight: 720,
  defaultCommandTimeout: 4000,   // ms to wait for DOM commands
  pageLoadTimeout: 60000,        // ms to wait for page loads
  requestTimeout: 5000,          // ms to wait for cy.request()
  responseTimeout: 30000,        // ms to wait for server response
  execTimeout: 60000,            // ms to wait for cy.exec()

  // --- Test Behavior ---
  watchForFileChanges: true,
  screenshotOnRunFailure: true,
  video: true,
  videoCompression: 32,
  trashAssetsBeforeRuns: true,

  // --- Retries ---
  retries: {
    runMode: 2,    // Retries in `cypress run`
    openMode: 0,   // Retries in `cypress open`
  },

  // --- Environment Variables ---
  env: {
    apiUrl: 'https://api.example.com',
    adminEmail: 'admin@example.com',
    adminPassword: 'secret',
  },
});
```

### Multiple Environments via `cypress.env.json`

```json
// cypress.env.json  (gitignored — for local secrets)
{
  "apiKey": "my-local-api-key",
  "stagingUrl": "https://staging.example.com"
}
```

### Reading Environment Variables in Tests

```js
// Access in tests
cy.visit(Cypress.env('stagingUrl'));
const token = Cypress.env('apiKey');

// Override at runtime
npx cypress run --env apiUrl=https://prod.api.com,adminEmail=prod@example.com
```

### TypeScript Configuration

```bash
npm install typescript --save-dev
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["es5", "dom"],
    "types": ["cypress", "node"]
  },
  "include": ["cypress/**/*.ts"]
}
```

---

## 4. Test Structure & Lifecycle Hooks

### Basic Test Anatomy

```js
// cypress/e2e/example.cy.js

describe('User Authentication', () => {
  // Runs ONCE before ALL tests in this describe block
  before(() => {
    cy.log('Suite starting — seed database');
  });

  // Runs ONCE after ALL tests in this describe block
  after(() => {
    cy.log('Suite done — clean up database');
  });

  // Runs before EACH test
  beforeEach(() => {
    cy.visit('/login');
  });

  // Runs after EACH test
  afterEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('shows the login form', () => {
    cy.get('[data-cy="login-form"]').should('be.visible');
  });

  it('logs in with valid credentials', () => {
    cy.get('[data-cy="email"]').type('user@example.com');
    cy.get('[data-cy="password"]').type('password123');
    cy.get('[data-cy="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

### Nested Describe Blocks

```js
describe('Product Page', () => {
  describe('when logged out', () => {
    it('shows a login prompt', () => { /* ... */ });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      cy.login(); // custom command
    });

    it('adds product to cart', () => { /* ... */ });
    it('adds product to wishlist', () => { /* ... */ });
  });
});
```

### Exclusive & Skipped Tests

```js
// Run ONLY this test (focused)
it.only('runs exclusively', () => { /* ... */ });

// Skip this test
it.skip('is temporarily disabled', () => { /* ... */ });

// Conditionally skip
it('runs on staging only', function () {
  if (Cypress.env('environment') !== 'staging') {
    this.skip();
  }
  // ...
});
```

### Context Alias

`context()` is an alias for `describe()` — useful for readability:

```js
context('Given a logged-in user', () => {
  context('When navigating to settings', () => {
    it('should display profile options', () => { /* ... */ });
  });
});
```

---

## 5. Selectors & DOM Traversal

### Primary Selection Commands

```js
// Get by CSS selector
cy.get('.btn-primary')
cy.get('#submit-button')
cy.get('input[type="email"]')
cy.get('[data-cy="search-input"]')   // ← RECOMMENDED

// Get by text content
cy.contains('Submit')
cy.contains('button', 'Submit')      // element + text
cy.contains(/submit/i)               // regex

// Get by URL hash / route
cy.get('[href="/dashboard"]')
```

### Recommended Selector Strategy (Priority Order)

```
1. data-cy="..."           ← Purpose-built for testing (best)
2. data-testid="..."       ← Common alternative
3. aria-label="..."        ← Accessible + test-friendly
4. #id                     ← Stable if controlled
5. .class                  ← Fragile — avoid if possible
6. element tag             ← Most fragile — only for unique elements
```

### DOM Traversal Commands

```js
// Find descendants
cy.get('.form').find('input[type="email"]')

// Traverse siblings
cy.get('.item').first()           // first element
cy.get('.item').last()            // last element
cy.get('.item').eq(2)             // zero-indexed
cy.get('.item').next()            // next sibling
cy.get('.item').prev()            // previous sibling
cy.get('.item').nextAll()         // all following siblings
cy.get('.item').prevAll()         // all preceding siblings

// Traverse ancestors
cy.get('input').parent()          // immediate parent
cy.get('input').parents('form')   // closest matching ancestor
cy.get('input').closest('.card')  // like .parents() but stops at first match

// Scope commands to a container
cy.get('.sidebar').within(() => {
  cy.get('a').click();            // only finds links inside .sidebar
});

// Filter results
cy.get('li').filter('.active')
cy.get('li').not('.disabled')

// Get window / document
cy.window()
cy.document()
```

### Getting Multiple Elements

```js
cy.get('li').should('have.length', 5);

cy.get('li').each(($el, index) => {
  cy.wrap($el).should('be.visible');
});
```

---

## 6. Actions & Interactions

### Mouse Actions

```js
cy.get('.btn').click()
cy.get('.btn').click({ force: true })           // bypass visibility check
cy.get('.btn').click({ multiple: true })        // click all matches
cy.get('.btn').click(15, 40)                    // click at coordinates (x, y)
cy.get('.btn').dblclick()                       // double-click
cy.get('.btn').rightclick()                     // right-click (context menu)

// Mouse events
cy.get('.draggable').trigger('mousedown')
cy.get('.draggable').trigger('mousemove', { clientX: 200, clientY: 300 })
cy.get('.draggable').trigger('mouseup')

// Hover (no native hover; use trigger)
cy.get('.menu-item').trigger('mouseover')
cy.get('.menu-item').trigger('mouseenter')
```

### Keyboard & Input

```js
// Type text
cy.get('input').type('Hello World')
cy.get('input').type('Hello{enter}')        // special key: Enter
cy.get('input').type('{ctrl}a')             // Ctrl+A
cy.get('input').type('{backspace}')
cy.get('input').type('{esc}')
cy.get('input').type('{uparrow}')
cy.get('input').type('{selectall}')

// Type with delay (simulates slow typing)
cy.get('input').type('Hello', { delay: 100 })

// Clear then type
cy.get('input').clear().type('New Value')

// Textarea
cy.get('textarea').type('Multi{enter}Line{enter}Text')

// Invoke value setter (for React-controlled inputs)
cy.get('input').invoke('val', 'value').trigger('input')

// Focus / Blur
cy.get('input').focus()
cy.get('input').blur()

// Press Tab key to move focus
cy.get('#field1').type('{tab}')
```

### Form Controls

```js
// Checkboxes & Radio buttons
cy.get('[type="checkbox"]').check()
cy.get('[type="checkbox"]').uncheck()
cy.get('[type="checkbox"]').check({ force: true })
cy.get('[name="gender"]').check('male')             // check by value
cy.get('[type="checkbox"]').check(['option1', 'option2'])

// Select dropdowns
cy.get('select').select('Option Text')              // by visible text
cy.get('select').select('option_value')             // by value
cy.get('select').select(2)                          // by index
cy.get('select[multiple]').select(['A', 'B'])       // multi-select

// File upload (native)
cy.get('input[type="file"]').selectFile('cypress/fixtures/sample.pdf')
cy.get('input[type="file"]').selectFile(['file1.png', 'file2.png'])  // multiple
cy.get('input[type="file"]').selectFile('cypress/fixtures/image.png', { action: 'drag-drop' })

// Form submit
cy.get('form').submit()
```

### Scroll Commands

```js
// Scroll page
cy.scrollTo('bottom')
cy.scrollTo('top')
cy.scrollTo(0, 500)                             // (x, y)
cy.scrollTo('50%', '50%')

// Scroll element into view
cy.get('.lazy-loaded-section').scrollIntoView()
cy.get('.item').scrollIntoView({ easing: 'linear', duration: 500 })

// Scroll inside a container
cy.get('.scrollable-list').scrollTo('bottom')
```

---

## 7. Assertions

### `.should()` — Chainable Assertions

```js
// Visibility
cy.get('.modal').should('be.visible')
cy.get('.hidden').should('not.be.visible')
cy.get('.removed').should('not.exist')
cy.get('.pending').should('exist')

// Text content
cy.get('h1').should('have.text', 'Welcome')
cy.get('p').should('contain.text', 'partial match')
cy.get('input').should('have.value', 'expected')

// CSS & Attributes
cy.get('a').should('have.attr', 'href', '/dashboard')
cy.get('a').should('have.attr', 'href').and('include', 'example.com')
cy.get('.btn').should('have.class', 'active')
cy.get('.btn').should('not.have.class', 'disabled')
cy.get('input').should('be.disabled')
cy.get('input').should('be.enabled')
cy.get('input').should('be.checked')

// DOM structure
cy.get('ul').should('have.length', 5)
cy.get('ul').children().should('have.length.greaterThan', 0)
cy.get('ul').children().should('have.length.at.least', 3)

// CSS properties
cy.get('.box').should('have.css', 'display', 'flex')
cy.get('.text').should('have.css', 'color', 'rgb(255, 0, 0)')

// Multiple assertions (chained)
cy.get('input')
  .should('be.visible')
  .and('not.be.disabled')
  .and('have.attr', 'placeholder', 'Enter email')
```

### `expect()` — BDD Assertions (inside `.then()`)

```js
cy.get('.price').then(($el) => {
  const price = parseFloat($el.text().replace('$', ''));
  expect(price).to.be.greaterThan(0);
  expect(price).to.be.lessThan(1000);
  expect(price).to.equal(29.99);
  expect(price).to.be.closeTo(30, 0.5);
});

// String assertions
expect('Hello World').to.include('World');
expect('Hello').to.match(/^H/);

// Array/Object assertions
expect([1, 2, 3]).to.have.length(3);
expect([1, 2, 3]).to.include(2);
expect({ name: 'Alice' }).to.have.property('name', 'Alice');
expect({ a: 1, b: 2 }).to.deep.equal({ a: 1, b: 2 });
```

### Negative Assertions

```js
cy.get('.error').should('not.be.visible')
cy.get('.error').should('not.have.text', 'Invalid email')
cy.get('[data-cy="item"]').should('not.exist')
```

### URL & Route Assertions

```js
cy.url().should('eq', 'http://localhost:3000/dashboard')
cy.url().should('include', '/dashboard')
cy.url().should('not.include', '/login')
cy.location('pathname').should('eq', '/dashboard')
cy.location('search').should('eq', '?tab=settings')
cy.title().should('eq', 'Dashboard | MyApp')
```

---

## 8. Aliases & Variables

### Defining Aliases with `.as()`

```js
// Alias an element
cy.get('[data-cy="submit-btn"]').as('submitBtn');
cy.get('@submitBtn').click();

// Alias a network request
cy.intercept('POST', '/api/login').as('loginRequest');
cy.get('@loginRequest').its('response.statusCode').should('eq', 200);

// Alias a fixture
cy.fixture('user.json').as('userData');
cy.get('@userData').then((user) => {
  cy.get('[data-cy="email"]').type(user.email);
});
```

### Saving & Using Values

```js
// Store text value for later assertion
cy.get('.product-title').invoke('text').as('productTitle');

// Use it later
cy.get('@productTitle').then((title) => {
  cy.get('.cart-item').should('contain', title);
});
```

### Using `.then()` to Work with DOM Values

```js
// Cannot use cy commands inside .then() that return values directly
// WRONG:
let myText;
cy.get('.title').then(($el) => {
  myText = $el.text(); // This works
});
cy.log(myText);        // But this runs BEFORE .then()! Undefined.

// CORRECT — keep everything inside the Cypress command chain:
cy.get('.title').then(($el) => {
  const title = $el.text();
  cy.get('.breadcrumb').should('contain', title);
});
```

---

## 9. Network Interception & Stubbing

### `cy.intercept()` — The Core API

```js
// Intercept & spy (no stub — passes through to real server)
cy.intercept('GET', '/api/users').as('getUsers');
cy.visit('/users');
cy.wait('@getUsers').then((interception) => {
  expect(interception.response.statusCode).to.eq(200);
  expect(interception.response.body).to.have.length(3);
});

// Stub with static response
cy.intercept('GET', '/api/users', {
  statusCode: 200,
  body: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
}).as('getUsers');

// Stub with a fixture file
cy.intercept('GET', '/api/products', { fixture: 'products.json' }).as('getProducts');

// Stub with dynamic response
cy.intercept('POST', '/api/orders', (req) => {
  req.reply({
    statusCode: 201,
    body: { id: 999, status: 'created', ...req.body },
  });
}).as('createOrder');
```

### URL Matching Patterns

```js
// Exact URL
cy.intercept('GET', 'https://api.example.com/users')

// Glob pattern
cy.intercept('GET', '/api/users/*')          // matches /api/users/1, /api/users/abc
cy.intercept('GET', '/api/**')               // matches any path starting with /api/

// Regex
cy.intercept('GET', /\/api\/users\/\d+/)

// Query string matching
cy.intercept('GET', { pathname: '/api/search', query: { q: 'cypress' } })

// Method wildcard
cy.intercept({ method: '*(GET|POST)', url: '/api/data' })
```

### Waiting for Requests

```js
// Wait for a single request
cy.wait('@getUsers');

// Wait with timeout override
cy.wait('@slowRequest', { timeout: 15000 });

// Wait for multiple
cy.wait(['@getUsers', '@getProducts']);

// Assert on the interception
cy.wait('@createOrder').its('request.body').should('deep.include', {
  productId: 42,
  quantity: 2,
});
```

### Simulating Errors & Delays

```js
// Simulate network error
cy.intercept('GET', '/api/data', { forceNetworkError: true });

// Simulate slow response
cy.intercept('GET', '/api/data', (req) => {
  req.reply((res) => {
    res.setDelay(3000); // 3 second delay
    res.send({ data: [] });
  });
});

// 500 error
cy.intercept('POST', '/api/submit', { statusCode: 500, body: { error: 'Server Error' } });

// 401 Unauthorized
cy.intercept('GET', '/api/protected', { statusCode: 401 });
```

### `cy.request()` — Direct HTTP Calls

```js
// GET request (no browser needed)
cy.request('GET', '/api/users').then((response) => {
  expect(response.status).to.eq(200);
  expect(response.body).to.be.an('array');
});

// POST request with body and headers
cy.request({
  method: 'POST',
  url: '/api/login',
  body: { email: 'user@example.com', password: 'pass123' },
  headers: { 'Content-Type': 'application/json' },
}).then((response) => {
  expect(response.status).to.eq(200);
  expect(response.body).to.have.property('token');
});

// Seed test data via API before a test
beforeEach(() => {
  cy.request('POST', '/api/test/seed', { scenario: 'empty-cart' });
});
```

---

## 10. Navigation Commands

```js
// Visit a URL
cy.visit('/home')                          // uses baseUrl from config
cy.visit('https://external.example.com')  // absolute URL
cy.visit('/page', {
  timeout: 10000,
  onBeforeLoad(win) {
    win.localStorage.setItem('token', 'abc123'); // set storage before page loads
  },
  onLoad(win) {
    // page is fully loaded
  },
});

// Browser history
cy.go('back')     // same as history.back()
cy.go('forward')  // same as history.forward()
cy.go(-2)         // go back 2 pages

// Reload
cy.reload()
cy.reload(true)   // force reload (bypass cache)

// Current URL & location
cy.url()                               // full URL string
cy.location()                          // full Location object
cy.location('pathname')               // e.g. '/dashboard'
cy.location('search')                 // e.g. '?page=2'
cy.location('hash')                   // e.g. '#section'
cy.location('host')                   // e.g. 'localhost:3000'

// Page title
cy.title().should('eq', 'My App - Dashboard')
```

---

## 11. Fixtures & Test Data

### Creating Fixture Files

```json
// cypress/fixtures/user.json
{
  "id": 1,
  "email": "alice@example.com",
  "password": "pass1234",
  "name": "Alice Johnson",
  "role": "admin"
}
```

```json
// cypress/fixtures/products.json
[
  { "id": 1, "name": "Widget A", "price": 9.99, "inStock": true },
  { "id": 2, "name": "Widget B", "price": 19.99, "inStock": false }
]
```

### Using Fixtures

```js
// Load once
cy.fixture('user.json').then((user) => {
  cy.get('[data-cy="email"]').type(user.email);
  cy.get('[data-cy="password"]').type(user.password);
});

// Load as alias
cy.fixture('products.json').as('products');
cy.get('@products').then((products) => {
  cy.get('.product-list').children().should('have.length', products.length);
});

// Inline with intercept
cy.intercept('GET', '/api/products', { fixture: 'products.json' });

// Load image fixture for upload
cy.fixture('avatar.png', 'base64').then((fileContent) => {
  cy.get('input[type="file"]').selectFile({
    contents: Cypress.Buffer.from(fileContent, 'base64'),
    fileName: 'avatar.png',
    mimeType: 'image/png',
  });
});
```

### Dynamic Test Data

```js
// Generate unique data to avoid conflicts
const timestamp = Date.now();
const email = `user_${timestamp}@test.com`;

// Use Faker (install separately)
import { faker } from '@faker-js/faker';

const user = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
};
```

---

## 12. Custom Commands

### Adding Custom Commands

```js
// cypress/support/commands.js

// Simple login command
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-cy="email"]').type(email);
    cy.get('[data-cy="password"]').type(password);
    cy.get('[data-cy="submit"]').click();
    cy.url().should('not.include', '/login');
  });
});

// API login (faster — skips UI)
Cypress.Commands.add('loginByApi', (email = Cypress.env('email'), password = Cypress.env('password')) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email, password },
  }).then(({ body }) => {
    window.localStorage.setItem('auth_token', body.token);
    cy.setCookie('session', body.sessionCookie);
  });
});

// Select a dropdown by text
Cypress.Commands.add('selectDropdown', (selector, optionText) => {
  cy.get(selector).click();
  cy.get('.dropdown-menu').contains(optionText).click();
});

// Assert toast notification
Cypress.Commands.add('assertToast', (message) => {
  cy.get('.toast').should('be.visible').and('contain', message);
  cy.get('.toast').should('not.exist'); // wait for it to disappear
});

// Fill a form generically
Cypress.Commands.add('fillForm', (formData) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[data-cy="${field}"]`).clear().type(value);
  });
});
```

### Overwriting Existing Commands

```js
// Override cy.visit() to include auth header
Cypress.Commands.overwrite('visit', (originalFn, url, options = {}) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
  }
  return originalFn(url, options);
});
```

### TypeScript Declarations for Custom Commands

```ts
// cypress/support/index.d.ts
declare namespace Cypress {
  interface Chainable {
    login(email?: string, password?: string): Chainable<void>;
    loginByApi(email?: string, password?: string): Chainable<void>;
    selectDropdown(selector: string, optionText: string): Chainable<void>;
    assertToast(message: string): Chainable<void>;
    fillForm(formData: Record<string, string>): Chainable<void>;
  }
}
```

---

## 13. Screenshots & Videos

### Automatic Screenshots

Cypress automatically captures a screenshot when a test fails during `cypress run`.

```js
// Manual screenshot
cy.screenshot()                          // full page
cy.screenshot('my-screenshot-name')     // named
cy.get('.chart').screenshot()           // element screenshot

// Configure in cypress.config.js
screenshotsFolder: 'cypress/screenshots',
screenshotOnRunFailure: true,
```

### Video Recording

```js
// cypress.config.js
video: true,
videoCompression: 32,   // 0 (max quality) to 51 (max compression)
videosFolder: 'cypress/videos',
```

---

## 14. Advanced Scenarios

### 14.1 iFrames

```js
// iframes are not directly supported — use cy.origin() or wrap
cy.get('iframe').then(($iframe) => {
  const doc = $iframe.contents();
  cy.wrap(doc).find('#inner-button').click();
});

// With cy.origin() for cross-origin iframes (Cypress 9.6+)
cy.origin('https://payment-processor.com', () => {
  cy.get('#card-number').type('4111111111111111');
  cy.get('#expiry').type('12/26');
  cy.get('#cvv').type('123');
});
```

### 14.2 Multiple Tabs / Windows

```js
// Cypress runs in a single tab — handle by stubbing window.open
cy.window().then((win) => {
  cy.stub(win, 'open').as('newTab');
});
cy.get('[data-cy="open-external"]').click();
cy.get('@newTab').should('have.been.calledWith', 'https://external.com');

// Or remove target="_blank" before clicking
cy.get('[data-cy="link"]')
  .invoke('removeAttr', 'target')
  .click();
cy.url().should('include', '/new-page');
```

### 14.3 Drag and Drop

```js
// Native HTML5 drag (using trigger)
cy.get('.draggable').trigger('dragstart');
cy.get('.droptarget').trigger('drop');

// More reliable with cypress-drag-drop plugin
// npm install @4tw/cypress-drag-drop
cy.get('.draggable').drag('.droptarget');

// Coordinate-based drag
cy.get('.slider').trigger('mousedown', { which: 1 })
  .trigger('mousemove', { clientX: 400 })
  .trigger('mouseup');
```

### 14.4 Date Pickers

```js
// Type into a date input
cy.get('input[type="date"]').type('2024-12-25');

// Click through a calendar widget
cy.get('[data-cy="date-picker-trigger"]').click();
cy.get('.calendar').should('be.visible');
cy.get('[data-cy="next-month"]').click();
cy.get('[data-date="2024-01-15"]').click();
cy.get('[data-cy="confirm-date"]').click();
```

### 14.5 Cookies & LocalStorage

```js
// Cookies
cy.getCookie('session_token').should('exist');
cy.setCookie('remember_me', 'true');
cy.clearCookie('session_token');
cy.clearCookies();
cy.getCookies().should('have.length', 2);

// LocalStorage
cy.window().then((win) => {
  win.localStorage.setItem('theme', 'dark');
  expect(win.localStorage.getItem('theme')).to.eq('dark');
  win.localStorage.removeItem('theme');
});

// SessionStorage
cy.window().its('sessionStorage').invoke('setItem', 'key', 'value');
cy.window().its('sessionStorage').invoke('getItem', 'key').should('eq', 'value');
```

### 14.6 Shadow DOM

```js
// Cypress supports shadow DOM with includeShadowDom
cy.get('.web-component', { includeShadowDom: true })
  .find('.inner-button', { includeShadowDom: true })
  .click();

// Enable globally in config
// cypress.config.js
// includeShadowDom: true
```

### 14.7 Clipboard

```js
// Read clipboard after copy action
cy.get('[data-cy="copy-btn"]').click();
cy.window().then((win) => {
  win.navigator.clipboard.readText().then((text) => {
    expect(text).to.eq('https://example.com/shared-link');
  });
});
```

### 14.8 Tables

```js
// Assert table row count
cy.get('table tbody tr').should('have.length', 10);

// Find a cell by row/column
cy.get('table tbody tr').eq(2).find('td').eq(1).should('contain', 'Alice');

// Find a row containing specific text
cy.get('table tbody tr').contains('tr', 'Alice').within(() => {
  cy.get('td').eq(2).should('contain', 'Admin');
  cy.get('[data-cy="delete-btn"]').click();
});

// Verify table is sorted
cy.get('table tbody tr td:first-child').then(($cells) => {
  const names = [...$cells].map((el) => el.innerText);
  const sorted = [...names].sort();
  expect(names).to.deep.equal(sorted);
});
```

### 14.9 File Downloads

```js
// Verify download with cy.readFile
cy.get('[data-cy="download-btn"]').click();
cy.readFile('cypress/downloads/report.pdf', { timeout: 10000 }).should('exist');

// Configure downloads folder
// cypress.config.js -> downloadsFolder: 'cypress/downloads'
```

### 14.10 Keyboard Shortcuts

```js
// Global keyboard shortcut
cy.get('body').type('{ctrl}k');         // Ctrl+K
cy.get('body').type('{cmd}{shift}p');   // Cmd+Shift+P
cy.get('body').type('{alt}f4');         // Alt+F4

// Modifier keys
cy.get('.selectable').click().type('{shift}', { release: false });
cy.get('.another-selectable').click();
cy.get('body').type('{shift}', { release: true });
```

### 14.11 Resize and Viewport

```js
// Set viewport for responsive testing
cy.viewport(375, 812)    // iPhone X
cy.viewport(768, 1024)   // iPad
cy.viewport(1440, 900)   // Desktop
cy.viewport('iphone-x')  // Named preset
cy.viewport('macbook-15')

// Test both desktop and mobile in one spec
const sizes = ['iphone-6', 'ipad-2', [1024, 768]];
sizes.forEach((size) => {
  it(`renders correctly on ${size}`, () => {
    if (Cypress._.isArray(size)) {
      cy.viewport(size[0], size[1]);
    } else {
      cy.viewport(size);
    }
    cy.visit('/home');
    cy.get('[data-cy="hero"]').should('be.visible');
  });
});
```

### 14.12 Timers & Clock Control

```js
// Freeze time
cy.clock(new Date('2024-06-15').getTime());
cy.visit('/');
cy.get('.current-date').should('contain', 'June 15, 2024');

// Tick time forward
cy.clock();
cy.get('[data-cy="start-timer"]').click();
cy.tick(5000);  // advance 5 seconds
cy.get('[data-cy="elapsed"]').should('contain', '5s');

// Restore real clock
cy.clock().then((clock) => clock.restore());
```

---

## 15. Page Object Model (POM)

### Page Object Structure

```
cypress/
├── pages/
│   ├── BasePage.js
│   ├── LoginPage.js
│   ├── DashboardPage.js
│   └── ProductPage.js
└── e2e/
    └── checkout.cy.js
```

### BasePage

```js
// cypress/pages/BasePage.js
class BasePage {
  visit(path) {
    cy.visit(path);
    return this;
  }

  assertPageTitle(title) {
    cy.title().should('eq', title);
    return this;
  }

  assertUrl(path) {
    cy.url().should('include', path);
    return this;
  }

  clickNav(label) {
    cy.get('[data-cy="nav"]').contains(label).click();
    return this;
  }
}

module.exports = BasePage;
```

### LoginPage

```js
// cypress/pages/LoginPage.js
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  elements = {
    emailInput: () => cy.get('[data-cy="email"]'),
    passwordInput: () => cy.get('[data-cy="password"]'),
    submitBtn: () => cy.get('[data-cy="submit"]'),
    errorMessage: () => cy.get('[data-cy="error-msg"]'),
    forgotPasswordLink: () => cy.get('[data-cy="forgot-password"]'),
  };

  visit() {
    return super.visit('/login');
  }

  typeEmail(email) {
    this.elements.emailInput().clear().type(email);
    return this;
  }

  typePassword(password) {
    this.elements.passwordInput().clear().type(password);
    return this;
  }

  submit() {
    this.elements.submitBtn().click();
    return this;
  }

  login(email, password) {
    return this.typeEmail(email).typePassword(password).submit();
  }

  assertErrorMessage(message) {
    this.elements.errorMessage().should('be.visible').and('contain', message);
    return this;
  }
}

module.exports = new LoginPage();
```

### Using POM in Tests

```js
// cypress/e2e/login.cy.js
const loginPage = require('../pages/LoginPage');

describe('Login', () => {
  beforeEach(() => {
    loginPage.visit();
  });

  it('logs in with valid credentials', () => {
    loginPage
      .login('user@example.com', 'pass1234')
      .assertUrl('/dashboard');
  });

  it('shows error for invalid credentials', () => {
    loginPage
      .login('bad@example.com', 'wrongpass')
      .assertErrorMessage('Invalid email or password');
  });
});
```

---

## 16. Authentication Strategies

### Strategy 1: `cy.session()` — Cache Login State

```js
// cypress/support/commands.js
Cypress.Commands.add('login', (email = 'user@test.com', password = 'pass') => {
  cy.session(
    [email, password],              // cache key
    () => {
      cy.visit('/login');
      cy.get('[data-cy="email"]').type(email);
      cy.get('[data-cy="password"]').type(password);
      cy.get('[data-cy="submit"]').click();
      cy.url().should('not.include', '/login');
    },
    {
      validate() {
        // Called before restoring session — if it throws, session is re-created
        cy.request('/api/me').its('status').should('eq', 200);
      },
      cacheAcrossSpecs: true,   // Share session across all test files
    }
  );
});

// In tests
beforeEach(() => {
  cy.login();
  cy.visit('/dashboard');
});
```

### Strategy 2: API Login (Fastest)

```js
Cypress.Commands.add('loginByApi', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email, password },
  }).then(({ body }) => {
    // Set token in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('access_token', body.access_token);
    });
    cy.setCookie('refresh_token', body.refresh_token);
  });
});
```

### Strategy 3: Programmatic Login via Cookie

```js
Cypress.Commands.add('loginWithCookie', () => {
  cy.request('POST', '/api/auth/login', {
    username: Cypress.env('username'),
    password: Cypress.env('password'),
  }).then((response) => {
    cy.setCookie('AUTH', response.body.token);
  });
});
```

### Strategy 4: OAuth Token

```js
Cypress.Commands.add('loginWithOAuth', () => {
  cy.request({
    method: 'POST',
    url: 'https://auth.provider.com/oauth/token',
    body: {
      grant_type: 'password',
      client_id: Cypress.env('clientId'),
      client_secret: Cypress.env('clientSecret'),
      username: Cypress.env('username'),
      password: Cypress.env('password'),
    },
    form: true,
  }).then(({ body }) => {
    window.localStorage.setItem('oauth_token', body.access_token);
  });
});
```

---

## 17. Component Testing

### Setup

```bash
# Component testing is configured separately
npx cypress open --component
```

```js
// cypress.config.js
module.exports = defineConfig({
  component: {
    devServer: {
      framework: 'react',           // or 'vue', 'angular', 'svelte'
      bundler: 'vite',              // or 'webpack'
    },
    specPattern: 'src/**/*.cy.{js,ts,jsx,tsx}',
  },
});
```

### Testing a React Component

```jsx
// src/components/Button/Button.cy.jsx
import React from 'react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct label', () => {
    cy.mount(<Button label="Click Me" />);
    cy.get('button').should('have.text', 'Click Me');
  });

  it('calls onClick handler', () => {
    const onClickSpy = cy.spy().as('onClickSpy');
    cy.mount(<Button label="Click Me" onClick={onClickSpy} />);
    cy.get('button').click();
    cy.get('@onClickSpy').should('have.been.calledOnce');
  });

  it('is disabled when disabled prop is true', () => {
    cy.mount(<Button label="Click Me" disabled />);
    cy.get('button').should('be.disabled');
  });

  it('applies custom className', () => {
    cy.mount(<Button label="Submit" className="primary" />);
    cy.get('button').should('have.class', 'primary');
  });
});
```

### Testing a Vue Component

```js
// src/components/Counter/Counter.cy.js
import { Counter } from './Counter.vue';

describe('Counter', () => {
  it('increments count on click', () => {
    cy.mount(Counter, { props: { initialCount: 0 } });
    cy.get('[data-cy="count"]').should('have.text', '0');
    cy.get('[data-cy="increment"]').click();
    cy.get('[data-cy="count"]').should('have.text', '1');
  });
});
```

---

## 18. Plugins & Ecosystem

### cypress-axe — Accessibility Testing

```bash
npm install cypress-axe axe-core --save-dev
```

```js
// cypress/support/e2e.js
import 'cypress-axe';

// In tests
it('has no accessibility violations', () => {
  cy.visit('/home');
  cy.injectAxe();
  cy.checkA11y();

  // Check specific element
  cy.checkA11y('[data-cy="navigation"]');

  // Exclude elements
  cy.checkA11y(null, {
    exclude: [['.legacy-widget']],
  });

  // Only check specific rules
  cy.checkA11y(null, {
    runOnly: { type: 'rule', values: ['color-contrast', 'label'] },
  });
});
```

### @testing-library/cypress

```bash
npm install @testing-library/cypress --save-dev
```

```js
// cypress/support/e2e.js
import '@testing-library/cypress/add-commands';

// In tests — query by ARIA roles
cy.findByRole('button', { name: /submit/i }).click();
cy.findByLabelText('Email address').type('test@example.com');
cy.findByPlaceholderText('Search...').type('cypress');
cy.findByText('Welcome back!').should('be.visible');
cy.findAllByRole('listitem').should('have.length', 3);
```

### cypress-real-events

```bash
npm install cypress-real-events --save-dev
```

```js
// For true browser-level events (hover, keyboard)
cy.get('.menu-item').realHover();
cy.get('input').realClick().realType('Hello');
cy.get('body').realPress('Tab');
cy.get('body').realPress(['Meta', 'Shift', 'P']);
```

---

## 19. CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/cypress.yml
name: Cypress Tests

on: [push, pull_request]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        containers: [1, 2, 3]   # Parallel workers

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Start app
        run: npm run start:ci &
        env:
          PORT: 3000

      - name: Wait for app
        run: npx wait-on http://localhost:3000

      - name: Run Cypress
        uses: cypress-io/github-action@v6
        with:
          record: true
          parallel: true
          group: 'E2E Tests'
          browser: chrome
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CYPRESS_baseUrl: http://localhost:3000
          CYPRESS_apiUrl: ${{ secrets.API_URL }}

      - name: Upload screenshots
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test

cypress:
  stage: test
  image: cypress/browsers:node18.12.0-chrome107
  script:
    - npm ci
    - npx cypress run --browser chrome --headless
  artifacts:
    when: always
    paths:
      - cypress/screenshots
      - cypress/videos
    expire_in: 1 week
  variables:
    CYPRESS_BASE_URL: "http://app:3000"
```

### Docker Compose (with app)

```yaml
# docker-compose.cypress.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'

  cypress:
    image: cypress/included:latest
    depends_on:
      - app
    environment:
      - CYPRESS_baseUrl=http://app:3000
    volumes:
      - ./:/e2e
    working_dir: /e2e
    command: cypress run --browser chrome
```

---

## 20. Debugging Techniques

### Time-Travel Debugging

The Cypress Test Runner shows a **command log** on the left. Hover over any command to snapshot the DOM state at that moment. Click to pin that state.

### Pause & Debug in Tests

```js
it('debugs mid-test', () => {
  cy.visit('/login');
  cy.pause();                       // Pauses execution — use GUI to step forward
  cy.get('[data-cy="email"]').type('test@test.com');
  cy.get('[data-cy="email"]').debug();   // Opens DevTools with the subject
});
```

### `.then()` for Inspection

```js
cy.get('[data-cy="total-price"]')
  .then(($el) => {
    console.log('Element text:', $el.text());
    console.log('Element HTML:', $el.html());
    debugger;  // Opens DevTools debugger if DevTools is open
  })
  .should('contain', '$29.99');
```

### Logging

```js
cy.log('Starting checkout flow');
cy.log('Cart total', '$59.98');

// Log inside .then()
cy.get('input').then(($el) => {
  cy.log('Input value:', $el.val());
});
```

### Task — Run Node.js Code for Debugging

```js
// cypress.config.js
setupNodeEvents(on) {
  on('task', {
    log(message) {
      console.log(message);
      return null;
    },
    table(data) {
      console.table(data);
      return null;
    },
  });
}

// In tests
cy.task('log', 'Some debug info from the test');
cy.task('table', [{ user: 'alice', status: 'active' }]);
```

---

## 21. Best Practices & Anti-patterns

### ✅ Do — Best Practices

```js
// 1. Use data-cy attributes for selectors
cy.get('[data-cy="submit-btn"]')  // ✅ stable, semantic

// 2. Use cy.session() for login — run once per test suite
beforeEach(() => { cy.login(); });

// 3. Avoid hard waits — use conditions instead
cy.get('[data-cy="spinner"]', { timeout: 10000 }).should('not.exist');  // ✅
// NOT: cy.wait(5000)  ❌

// 4. Use cy.intercept() to control network
cy.intercept('GET', '/api/orders').as('getOrders');
cy.wait('@getOrders');  // ✅ deterministic

// 5. Test only ONE thing per it() block
it('shows error for invalid email format', () => { /* one assertion focus */ });

// 6. Keep tests independent — no shared state
afterEach(() => { cy.clearCookies(); cy.clearLocalStorage(); });

// 7. Seed test data via API (faster than UI)
beforeEach(() => {
  cy.request('POST', '/api/test/seed', { scenario: 'user-with-orders' });
});

// 8. Use fixtures for reusable test data
cy.fixture('checkout-user').as('user');

// 9. Use aliases to avoid re-querying the DOM
cy.get('[data-cy="total"]').as('total');
cy.get('@total').should('contain', '$29.99');
cy.get('@total').invoke('text').then(parseFloat);
```

### ❌ Don't — Anti-patterns

```js
// 1. Don't use arbitrary waits
cy.wait(3000);  // ❌ flaky — use cy.intercept or element conditions

// 2. Don't test third-party services
cy.visit('https://google.com');  // ❌ not your app

// 3. Don't couple tests — each test must set its own state
it('test 2 depends on test 1 state', () => { /* ❌ */ });

// 4. Don't use class/tag selectors that change with styling
cy.get('.MuiButton-root');  // ❌ breaks with version upgrades

// 5. Don't assign command results to variables directly
let el = cy.get('.thing');  // ❌ — el is a Cypress Chainable, not a DOM element
el.click();                 // ❌ This will fail

// 6. Don't use return in command chains expecting synchronous values
const text = cy.get('.price').text();  // ❌ undefined

// 7. Don't use conditional testing (if/else on DOM)
cy.get('body').then(($body) => {
  if ($body.find('.modal').length) {
    cy.get('.modal .close').click();
  }
});  // ❌ This is fragile — tests should be deterministic
```

### Flaky Test Prevention

```js
// Use retry-ability with longer timeouts for slow elements
cy.get('[data-cy="result"]', { timeout: 10000 }).should('be.visible');

// Set retries in config for resilience
// cypress.config.js: retries: { runMode: 2 }

// Wait for animations to complete
cy.get('.modal').should('have.css', 'opacity', '1');

// Use force: true cautiously for overlapping elements
cy.get('.btn').click({ force: true });
```

---

## 22. Real-World Test Suites

### 22.1 Complete Login / Logout Flow

```js
describe('Authentication', () => {
  const user = { email: 'alice@test.com', password: 'Pass1234!' };

  it('logs in successfully', () => {
    cy.visit('/login');
    cy.get('[data-cy="email"]').type(user.email);
    cy.get('[data-cy="password"]').type(user.password);
    cy.get('[data-cy="login-btn"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="welcome-msg"]').should('contain', 'Welcome, Alice');
  });

  it('shows error for invalid credentials', () => {
    cy.visit('/login');
    cy.get('[data-cy="email"]').type('wrong@test.com');
    cy.get('[data-cy="password"]').type('wrongpass');
    cy.get('[data-cy="login-btn"]').click();
    cy.get('[data-cy="error"]')
      .should('be.visible')
      .and('contain', 'Invalid credentials');
    cy.url().should('include', '/login');
  });

  it('requires email', () => {
    cy.visit('/login');
    cy.get('[data-cy="login-btn"]').click();
    cy.get('[data-cy="email-error"]').should('contain', 'Email is required');
  });

  it('logs out', () => {
    cy.login(user.email, user.password);
    cy.visit('/dashboard');
    cy.get('[data-cy="user-menu"]').click();
    cy.get('[data-cy="logout"]').click();
    cy.url().should('include', '/login');
    cy.getCookie('session').should('not.exist');
  });
});
```

### 22.2 E-Commerce Checkout Flow

```js
describe('Checkout Flow', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('POST', '/api/orders').as('createOrder');
    cy.intercept('GET', '/api/products*').as('getProducts');
  });

  it('completes full checkout', () => {
    // Visit shop
    cy.visit('/shop');
    cy.wait('@getProducts');

    // Add product to cart
    cy.get('[data-cy="product-card"]').first().within(() => {
      cy.get('[data-cy="add-to-cart"]').click();
    });
    cy.get('[data-cy="cart-count"]').should('contain', '1');

    // Go to cart
    cy.get('[data-cy="cart-icon"]').click();
    cy.get('[data-cy="cart-item"]').should('have.length', 1);

    // Proceed to checkout
    cy.get('[data-cy="checkout-btn"]').click();
    cy.url().should('include', '/checkout');

    // Fill shipping info
    cy.get('[data-cy="first-name"]').type('Alice');
    cy.get('[data-cy="last-name"]').type('Johnson');
    cy.get('[data-cy="address"]').type('123 Main St');
    cy.get('[data-cy="city"]').type('Springfield');
    cy.get('[data-cy="zip"]').type('12345');

    // Select shipping method
    cy.get('[data-cy="shipping-standard"]').check();

    // Fill payment
    cy.get('[data-cy="card-number"]').type('4111111111111111');
    cy.get('[data-cy="expiry"]').type('12/26');
    cy.get('[data-cy="cvv"]').type('123');

    // Place order
    cy.get('[data-cy="place-order"]').click();
    cy.wait('@createOrder').then((interception) => {
      expect(interception.response.statusCode).to.eq(201);
      expect(interception.response.body).to.have.property('orderId');
    });

    // Confirmation page
    cy.get('[data-cy="order-confirmation"]').should('be.visible');
    cy.get('[data-cy="order-id"]').should('exist');
    cy.get('[data-cy="cart-count"]').should('contain', '0');
  });

  it('shows empty cart message', () => {
    cy.visit('/cart');
    cy.get('[data-cy="empty-cart-msg"]').should('contain', 'Your cart is empty');
    cy.get('[data-cy="checkout-btn"]').should('not.exist');
  });
});
```

### 22.3 Search & Filtering

```js
describe('Search & Filter', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/products*').as('search');
    cy.visit('/products');
  });

  it('searches by keyword', () => {
    cy.get('[data-cy="search-input"]').type('Widget{enter}');
    cy.wait('@search').its('request.url').should('include', 'q=Widget');
    cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 0);
    cy.get('[data-cy="product-title"]').each(($title) => {
      expect($title.text().toLowerCase()).to.include('widget');
    });
  });

  it('filters by category', () => {
    cy.get('[data-cy="filter-category"]').select('Electronics');
    cy.wait('@search');
    cy.get('[data-cy="product-card"]').each(($card) => {
      cy.wrap($card).find('[data-cy="product-category"]').should('contain', 'Electronics');
    });
  });

  it('sorts by price: low to high', () => {
    cy.get('[data-cy="sort-select"]').select('price-asc');
    cy.wait('@search');
    cy.get('[data-cy="product-price"]').then(($prices) => {
      const prices = [...$prices].map(($el) => parseFloat($el.innerText.replace('$', '')));
      const sorted = [...prices].sort((a, b) => a - b);
      expect(prices).to.deep.equal(sorted);
    });
  });

  it('shows no results for unmatched query', () => {
    cy.intercept('GET', '/api/products*', { body: [] });
    cy.get('[data-cy="search-input"]').type('xyznonexistent{enter}');
    cy.get('[data-cy="no-results"]').should('be.visible').and('contain', 'No products found');
  });
});
```

### 22.4 CRUD Operations

```js
describe('Product Management (Admin)', () => {
  beforeEach(() => {
    cy.loginByApi('admin@test.com', 'adminpass');
    cy.intercept('POST', '/api/products').as('createProduct');
    cy.intercept('PUT', '/api/products/*').as('updateProduct');
    cy.intercept('DELETE', '/api/products/*').as('deleteProduct');
    cy.visit('/admin/products');
  });

  it('creates a new product', () => {
    cy.get('[data-cy="add-product-btn"]').click();
    cy.get('[data-cy="product-name"]').type('New Widget Pro');
    cy.get('[data-cy="product-price"]').type('49.99');
    cy.get('[data-cy="product-category"]').select('Electronics');
    cy.get('[data-cy="product-description"]').type('A great new widget.');
    cy.get('[data-cy="save-product"]').click();

    cy.wait('@createProduct').its('response.statusCode').should('eq', 201);
    cy.get('[data-cy="success-toast"]').should('contain', 'Product created');
    cy.get('[data-cy="product-table"]').should('contain', 'New Widget Pro');
  });

  it('edits an existing product', () => {
    cy.get('[data-cy="product-row"]').first().find('[data-cy="edit-btn"]').click();
    cy.get('[data-cy="product-name"]').clear().type('Updated Widget Name');
    cy.get('[data-cy="save-product"]').click();

    cy.wait('@updateProduct').its('response.statusCode').should('eq', 200);
    cy.get('[data-cy="product-table"]').should('contain', 'Updated Widget Name');
  });

  it('deletes a product with confirmation', () => {
    cy.get('[data-cy="product-row"]').first().find('[data-cy="product-name"]').invoke('text').as('deletedName');
    cy.get('[data-cy="product-row"]').first().find('[data-cy="delete-btn"]').click();
    cy.get('[data-cy="confirm-dialog"]').should('be.visible');
    cy.get('[data-cy="confirm-delete"]').click();

    cy.wait('@deleteProduct').its('response.statusCode').should('eq', 200);
    cy.get('@deletedName').then((name) => {
      cy.get('[data-cy="product-table"]').should('not.contain', name);
    });
  });
});
```

### 22.5 Modal Dialogs

```js
describe('Modal Dialogs', () => {
  it('opens, interacts with, and closes a modal', () => {
    cy.visit('/dashboard');
    cy.get('[data-cy="open-modal-btn"]').click();

    // Modal is open
    cy.get('[data-cy="modal"]').should('be.visible');
    cy.get('[data-cy="modal-title"]').should('contain', 'Confirm Action');

    // Fill form inside modal
    cy.get('[data-cy="modal"]').within(() => {
      cy.get('[data-cy="reason-input"]').type('Testing modal');
      cy.get('[data-cy="confirm-btn"]').click();
    });

    // Modal closes after confirm
    cy.get('[data-cy="modal"]').should('not.exist');
    cy.get('[data-cy="success-banner"]').should('be.visible');
  });

  it('closes modal on backdrop click', () => {
    cy.get('[data-cy="open-modal-btn"]').click();
    cy.get('[data-cy="modal-overlay"]').click({ force: true });
    cy.get('[data-cy="modal"]').should('not.exist');
  });

  it('closes modal on ESC key', () => {
    cy.get('[data-cy="open-modal-btn"]').click();
    cy.get('body').type('{esc}');
    cy.get('[data-cy="modal"]').should('not.exist');
  });
});
```

### 22.6 Pagination

```js
describe('Pagination', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/items?page=*').as('getPage');
    cy.visit('/items');
  });

  it('loads page 1 by default', () => {
    cy.wait('@getPage').its('request.url').should('include', 'page=1');
    cy.get('[data-cy="pagination-current"]').should('contain', '1');
  });

  it('navigates to next page', () => {
    cy.get('[data-cy="next-page"]').click();
    cy.wait('@getPage').its('request.url').should('include', 'page=2');
    cy.url().should('include', 'page=2');
    cy.get('[data-cy="pagination-current"]').should('contain', '2');
  });

  it('navigates to a specific page', () => {
    cy.get('[data-cy="page-btn-3"]').click();
    cy.wait('@getPage');
    cy.get('[data-cy="pagination-current"]').should('contain', '3');
  });

  it('disables previous on first page', () => {
    cy.get('[data-cy="prev-page"]').should('be.disabled');
  });

  it('disables next on last page', () => {
    cy.get('[data-cy="page-btn-last"]').click();
    cy.get('[data-cy="next-page"]').should('be.disabled');
  });
});
```

### 22.7 Form Validation

```js
describe('Registration Form Validation', () => {
  beforeEach(() => cy.visit('/register'));

  const testCases = [
    { field: 'email', value: 'notanemail', error: 'Enter a valid email' },
    { field: 'password', value: '123', error: 'Password must be at least 8 characters' },
    { field: 'phone', value: '12345', error: 'Enter a valid phone number' },
  ];

  testCases.forEach(({ field, value, error }) => {
    it(`validates ${field} field`, () => {
      cy.get(`[data-cy="${field}"]`).type(value).blur();
      cy.get(`[data-cy="${field}-error"]`).should('contain', error);
    });
  });

  it('prevents submission with empty required fields', () => {
    cy.get('[data-cy="register-btn"]').click();
    cy.get('[data-cy="email-error"]').should('be.visible');
    cy.get('[data-cy="password-error"]').should('be.visible');
    cy.url().should('include', '/register');
  });

  it('validates password confirmation match', () => {
    cy.get('[data-cy="password"]').type('mypassword123');
    cy.get('[data-cy="confirm-password"]').type('different123').blur();
    cy.get('[data-cy="confirm-password-error"]').should('contain', 'Passwords do not match');
  });
});
```

---

## Quick Reference Card

```
COMMANDS                    ASSERTIONS
cy.get()         select     .should('be.visible')
cy.contains()    text       .should('not.exist')
cy.visit()       navigate   .should('have.text', 'X')
cy.click()       interact   .should('have.value', 'X')
cy.type()        input      .should('have.class', 'X')
cy.intercept()   network    .should('have.length', N)
cy.fixture()     data       .and('include', 'X')
cy.session()     auth       .should('be.disabled')
cy.wait()        timing     .should('be.checked')

SELECTORS (best → worst)
[data-cy="x"]  > #id  > [aria-label]  > .class  > tag

HOOKS
before()     once before suite
after()      once after suite
beforeEach() before every test
afterEach()  after every test
```

---

*Tutorial covers Cypress v12+. For the latest API reference, visit [docs.cypress.io](https://docs.cypress.io).*
