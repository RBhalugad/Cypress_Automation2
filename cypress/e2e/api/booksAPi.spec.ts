import { faker } from '@faker-js/faker';
import { BooksResponse, Book, PostBooksPayload } from '../../types/api.types';

const BOOKSTORE_URL = 'https://demoqa.com/BookStore/v1';
const ACCOUNT_URL = 'https://demoqa.com/Account/v1';

const generatePassword = (): string =>
    `${faker.string.alpha({ casing: 'upper', length: 2 })}` +
    `${faker.string.alpha({ casing: 'lower', length: 2 })}` +
    `${faker.string.numeric(2)}@!`;

const BOOK_ISBN = '9781449325862';
const REPLACE_ISBN = '9781449331818';

describe('Books API Tests', () => {
    let userId: string;
    let token: string;
    const username = faker.internet.email();
    const password = generatePassword();
    const userPayload = { userName: username, password };

    before(() => {
        cy.request({
            method: 'POST',
            url: `${ACCOUNT_URL}/User`,
            body: userPayload,
        }).then((res) => {
            expect(res.status).to.eq(201);
            userId = res.body.userID;
        });

        cy.request({
            method: 'POST',
            url: `${ACCOUNT_URL}/GenerateToken`,
            body: userPayload,
        }).then((res) => {
            expect(res.status).to.eq(200);
            token = res.body.token;
        });
    });

    after(() => {
        cy.request({
            method: 'DELETE',
            url: `${ACCOUNT_URL}/User/${userId}`,
            headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
            expect(res.status).to.eq(204);
        });
    });

    it('GET /Books - Get all books and verify structure', () => {
        cy.request<BooksResponse>({
            method: 'GET',
            url: `${BOOKSTORE_URL}/Books`,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('books').and.to.be.an('array').and.to.not.be
                .empty;

            const books = response.body.books;

            books.forEach((book: Book) => {
                expect(book).to.have.property('isbn').and.to.be.a('string').and.to.not.be.empty;
                expect(book).to.have.property('title').and.to.be.a('string').and.to.not.be.empty;
                expect(book).to.have.property('author').and.to.be.a('string').and.to.not.be.empty;
                expect(book).to.have.property('publisher').and.to.be.a('string').and.to.not.be
                    .empty;
                expect(book).to.have.property('pages').and.to.be.a('number');
            });
        });
    });

    it('GET /Book?ISBN - Get each book by ISBN and verify response', () => {
        cy.request<BooksResponse>({
            method: 'GET',
            url: `${BOOKSTORE_URL}/Books`,
        }).then((response) => {
            expect(response.status).to.eq(200);

            const isbns: string[] = response.body.books.map((book: Book) => book.isbn);

            isbns.forEach((isbn) => {
                cy.request({
                    method: 'GET',
                    url: `${BOOKSTORE_URL}/Book`,
                    qs: { ISBN: isbn },
                }).then((bookResponse) => {
                    expect(bookResponse.status).to.eq(200);
                    expect(bookResponse.body).to.have.property('isbn', isbn);
                });
            });
        });
    });

    it('GET /Book?ISBN - Verify all fields for Git Pocket Guide (9781449325862)', () => {
        const expectedBook: Book = {
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

    it('POST /Books - Add a single book to user collection', () => {
        const body: PostBooksPayload = {
            userId,
            collectionOfIsbns: [{ isbn: BOOK_ISBN }],
        };
        cy.request({
            method: 'POST',
            url: `${BOOKSTORE_URL}/Books`,
            headers: { Authorization: `Bearer ${token}` },
            body,
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('books').and.to.be.an('array').and.to.not.be
                .empty;
            expect(response.body.books[0]).to.have.property('isbn', BOOK_ISBN);
        });
    });

    it('GET /User/{userId} - Verify added book appears in user profile', () => {
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
        });
    });

    it('PUT /Books/{ISBN} - Replace existing book in user collection', () => {
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
        });
    });

    it('DELETE /Book - Delete a single book from user collection', () => {
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
        });
    });

    it('POST /Books - Add multiple books to user collection', () => {
        const body: PostBooksPayload = {
            userId,
            collectionOfIsbns: [{ isbn: '9781449325862' }, { isbn: '9781449331818' }],
        };
        cy.request({
            method: 'POST',
            url: `${BOOKSTORE_URL}/Books`,
            headers: { Authorization: `Bearer ${token}` },
            body,
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('books').and.to.be.an('array');
            expect(response.body.books).to.have.length(2);
        });
    });

    it('DELETE /Books - Delete all books from user collection', () => {
        cy.request({
            method: 'DELETE',
            url: `${BOOKSTORE_URL}/Books`,
            headers: { Authorization: `Bearer ${token}` },
            qs: { UserId: userId },
        }).then((response) => {
            expect(response.status).to.eq(204);
            expect(response.body).to.be.empty;
        });
    });

    it('GET /User/{userId} - Verify user collection is empty after bulk delete', () => {
        cy.request({
            method: 'GET',
            url: `${ACCOUNT_URL}/User/${userId}`,
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('books').and.to.be.an('array').and.to.be.empty;
        });
    });
});
