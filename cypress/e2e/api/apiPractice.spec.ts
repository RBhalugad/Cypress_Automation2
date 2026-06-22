describe('practice api test', { tags: '@api' }, () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';
    let postData: { title: string; body: string; userId: number };
    let putData: { id: number; title: string; body: string; userId: number };
    let patchData: { title: string };

    beforeEach(() => {
        postData = {
            title: 'Test Post',
            body: 'This is a test post.',
            userId: 1,
        };
        putData = {
            id: 1,
            title: 'Updated Title',
            body: 'This post has been completely updated.',
            userId: 1,
        };
        patchData = {
            title: 'Patched Title Only',
        };
    });

    it('GET API testing', { tags: ['@api', '@smoke'] }, () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/posts/1`,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.deep.include({
                userId: 1,
                id: 1,
            });
        });
    });

    it('POST API testing', { tags: ['@api', '@regression'] }, () => {
        cy.request({
            method: 'POST',
            url: `${baseUrl}/posts`,
            body: postData,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.deep.include(postData);
            expect(response.body).to.have.property('id');
        });
    });

    it('PUT API testing', { tags: ['@api', '@regression'] }, () => {
        cy.request({
            method: 'PUT',
            url: `${baseUrl}/posts/1`,
            body: putData,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.deep.equal(putData);
        });
    });

    it('PATCH API testing', { tags: ['@api', '@regression'] }, () => {
        cy.request({
            method: 'PATCH',
            url: `${baseUrl}/posts/1`,
            body: patchData,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('title', patchData.title);
        });
    });

    it('DELETE API testing', { tags: ['@api', '@regression'] }, () => {
        cy.request('DELETE', `${baseUrl}/posts/1`).then((response) => {
            expect(response.status).to.eq(200);
        });
    });
});
