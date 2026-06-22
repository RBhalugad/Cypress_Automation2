import { faker } from '@faker-js/faker';

// ── Constants ──────────────────────────────────────────────────────────────
const BOOKSTORE_URL = 'https://demoqa.com/BookStore/v1';
const ACCOUNT_URL = 'https://demoqa.com/Account/v1';

// ── Password helper (meets DemoQA policy) ─────────────────────────────────
const generatePassword = (): string =>
    `${faker.string.alpha({ casing: 'upper', length: 2 })}` +
    `${faker.string.alpha({ casing: 'lower', length: 2 })}` +
    `${faker.string.numeric(2)}@!`;

// ── ISBNs available in DemoQA ─────────────────────────────────────────────
const BOOK_ISBN = '9781449325862'; // Git Pocket Guide  (primary test book)
const REPLACE_ISBN = '9781449331818'; // Learning JS Design Patterns (used in PUT /Books/{ISBN})

// ──────────────────────────────────────────────────────────────────────────
describe('Books API Tests', () => {
    // Shared auth state (populated in before())
    let userId: string;
    let token: string;
    const username = faker.internet.email();
    const password = generatePassword();
    const userPayload = { userName: username, password };

    // ── Setup: create user & generate token ──────────────────────────────
    before(() => {
        // 1. Create user
        cy.request({
            method: 'POST',
            url: `${ACCOUNT_URL}/User`,
            body: userPayload,
        }).then((res) => {
            expect(res.status).to.eq(201);
            userId = res.body.userID;
            cy.log(`Created user: ${userId}`);
        });

        // 2. Generate token
        cy.request({
            method: 'POST',
            url: `${ACCOUNT_URL}/GenerateToken`,
            body: userPayload,
        }).then((res) => {
            expect(res.status).to.eq(200);
            token = res.body.token;
            cy.log(`Token: ${token}`);
        });
    });

    // ── Teardown: delete user ─────────────────────────────────────────────
    after(() => {
        cy.request({
            method: 'DELETE',
            url: `${ACCOUNT_URL}/User/${userId}`,
            headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
            expect(res.status).to.eq(204);
            cy.log(`Deleted user: ${userId}`);
        });
    });

    // ── GET /Books ────────────────────────────────────────────────────────
    it('GET /Books - Get all books and verify structure', () => {
        cy.request({
            method: 'GET',
            url: `${BOOKSTORE_URL}/Books`,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('books').and.to.be.an('array').and.to.not.be
                .empty;

            const books = response.body.books;
            cy.log(`Total Books: ${books.length}`);

            books.forEach((book: any) => {
                expect(book).to.have.property('isbn').and.to.be.a('string').and.to.not.be.empty;
                expect(book).to.have.property('title').and.to.be.a('string').and.to.not.be.empty;
                expect(book).to.have.property('author').and.to.be.a('string').and.to.not.be.empty;
                expect(book).to.have.property('publisher').and.to.be.a('string').and.to.not.be
                    .empty;
                expect(book).to.have.property('pages').and.to.be.a('number');
            });
        });
    });

    // ── GET /Book?ISBN= ───────────────────────────────────────────────────
    it('GET /Book - Get each book by ISBN and verify', () => {
        cy.request({
            method: 'GET',
            url: `${BOOKSTORE_URL}/Books`,
        }).then((response) => {
            expect(response.status).to.eq(200);

            const isbns: string[] = response.body.books.map((book: any) => book.isbn);
            cy.log(`All ISBNs: ${isbns.join(', ')}`);

            isbns.forEach((isbn) => {
                cy.request({
                    method: 'GET',
                    url: `${BOOKSTORE_URL}/Book`,
                    qs: { ISBN: isbn },
                }).then((bookResponse) => {
                    expect(bookResponse.status).to.eq(200);
                    expect(bookResponse.body).to.have.property('isbn', isbn);
                    cy.log(`✅ Verified Book ISBN: ${isbn}`);
                });
            });
        });
    });

    // ── GET /Book?ISBN= (specific book) ───────────────────────────────────
    it('GET /Book - Verify all fields for Git Pocket Guide', () => {
        const expectedBook = {
            isbn: '9781449325862',
            title: 'Git Pocket Guide',
            subTitle: 'A Working Introduction',
            author: 'Richard E. Silverman',
            publish_date: '2020-06-04T08:48:39.000Z',
            publisher: "O'Reilly Media",
            pages: 234,
            description:
                'This pocket guide is the perfect on-the-job companion to Git, the distributed version control system. It provides a compact, readable introduction to Git for new users, as well as a reference to common commands and procedures for those of you with Git exp',
            website: 'http://chimera.labs.oreilly.com/books/1230000000561/index.html',
        };

        cy.request({
            method: 'GET',
            url: `${BOOKSTORE_URL}/Book`,
            qs: { ISBN: expectedBook.isbn },
        }).then((response) => {
            expect(response.status).to.eq(200);
            const book = response.body;
            expect(book.isbn).to.eq(expectedBook.isbn);
            expect(book.title).to.eq(expectedBook.title);
            expect(book.subTitle).to.eq(expectedBook.subTitle);
            expect(book.author).to.eq(expectedBook.author);
            expect(book.publish_date).to.eq(expectedBook.publish_date);
            expect(book.publisher).to.eq(expectedBook.publisher);
            expect(book.pages).to.eq(expectedBook.pages);
            expect(book.description).to.eq(expectedBook.description);
            expect(book.website).to.eq(expectedBook.website);
        });
    });

    // ── POST /Books - Add books to user's collection ──────────────────────
    it('POST /Books - Add a book to user collection', () => {
        cy.request({
            method: 'POST',
            url: `${BOOKSTORE_URL}/Books`,
            headers: { Authorization: `Bearer ${token}` },
            body: {
                userId,
                collectionOfIsbns: [{ isbn: BOOK_ISBN }],
            },
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('books').and.to.be.an('array').and.to.not.be
                .empty;
            expect(response.body.books[0]).to.have.property('isbn', BOOK_ISBN);
            cy.log(`✅ Added book ${BOOK_ISBN} to user collection`);
        });
    });

    // ── GET /Books?UserId= - Verify book was added ─────────────────────────
    it('GET /User/{userId} - Verify book appears in user profile', () => {
        cy.request({
            method: 'GET',
            url: `${ACCOUNT_URL}/User/${userId}`,
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('books').and.to.be.an('array').and.to.not.be
                .empty;
            const isbns = response.body.books.map((b: any) => b.isbn);
            expect(isbns).to.include(BOOK_ISBN);
            cy.log(`✅ Book ${BOOK_ISBN} confirmed in user profile`);
        });
    });

    // ── PUT /Books/{ISBN} - Replace a book in user's collection ───────────
    it('PUT /Books/{ISBN} - Replace book in user collection', () => {
        cy.request({
            method: 'PUT',
            url: `${BOOKSTORE_URL}/Books/${BOOK_ISBN}`,
            headers: { Authorization: `Bearer ${token}` },
            body: {
                userId,
                isbn: REPLACE_ISBN,
            },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('books').and.to.be.an('array');
            const isbns = response.body.books.map((b: any) => b.isbn);
            expect(isbns).to.include(REPLACE_ISBN);
            cy.log(`✅ Replaced ${BOOK_ISBN} → ${REPLACE_ISBN}`);
        });
    });

    // ── DELETE /Book - Delete a single book from user's collection ─────────
    it('DELETE /Book - Delete single book from user collection', () => {
        cy.request({
            method: 'DELETE',
            url: `${BOOKSTORE_URL}/Book`,
            headers: { Authorization: `Bearer ${token}` },
            body: {
                isbn: REPLACE_ISBN,
                userId,
            },
        }).then((response) => {
            expect(response.status).to.eq(204);
            cy.log(`✅ Deleted book ${REPLACE_ISBN} from user collection`);
        });
    });

    // ── POST /Books - Add multiple books ─────────────────────────────────
    it('POST /Books - Add multiple books to user collection', () => {
        cy.request({
            method: 'POST',
            url: `${BOOKSTORE_URL}/Books`,
            headers: { Authorization: `Bearer ${token}` },
            body: {
                userId,
                collectionOfIsbns: [{ isbn: '9781449325862' }, { isbn: '9781449331818' }],
            },
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('books').and.to.be.an('array');
            expect(response.body.books).to.have.length(2);
            cy.log(`✅ Added 2 books to user collection`);
        });
    });

    // ── DELETE /Books - Delete ALL books from user's collection ───────────
    it('DELETE /Books - Delete all books from user collection', () => {
        cy.request({
            method: 'DELETE',
            url: `${BOOKSTORE_URL}/Books`,
            headers: { Authorization: `Bearer ${token}` },
            qs: { UserId: userId },
        }).then((response) => {
            expect(response.status).to.eq(204);
            expect(response.body).to.be.empty;
            cy.log(`✅ Deleted all books from user collection`);
        });
    });

    // ── Verify collection is empty after DELETE /Books ────────────────────
    it('GET /User/{userId} - Verify user collection is empty after bulk delete', () => {
        cy.request({
            method: 'GET',
            url: `${ACCOUNT_URL}/User/${userId}`,
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('books').and.to.be.an('array').and.to.be.empty;
            cy.log('✅ User collection is empty');
        });
    });
});
