interface PlacePayload {
    location: { lat: number; lng: number };
    accuracy: number;
    name: string;
    phone_number: string;
    address: string;
    types: string[];
    website: string;
    language: string;
}

import { faker } from '@faker-js/faker';

describe('Verify google API', { tags: '@api' }, () => {
    const baseUrl: string = Cypress.env('baseurl');
    let addPlacePayload: PlacePayload;

    beforeEach(() => {
        addPlacePayload = {
            location: {
                lat: faker.location.latitude(),
                lng: faker.location.longitude(),
            },
            accuracy: 50,
            name: faker.person.firstName(),
            phone_number: faker.phone.number(),
            address: faker.location.streetAddress(),
            types: ['shoe park', 'shop'],
            website: faker.internet.url(),
            language: 'French-IN',
        };
    });

    it('verify addupdategetdelete place', { tags: ['@api', '@smoke'] }, () => {
        cy.log('*--- Adding a new place ---*');
        cy.request({
            method: 'POST',
            url: `${baseUrl}/maps/api/place/add/json`,
            qs: { key: 'qaclick123' },
            body: addPlacePayload,
            headers: { 'Content-Type': 'application/json' },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.scope).to.eq('APP');
            expect(response.headers.server).to.eq('Apache/2.4.52 (Ubuntu)');

            const postResponseBody = response.body;
            const placeId: string = postResponseBody.place_id;
            cy.log('*Place ID created:*', placeId);
            cy.log('*Add Place Response Body:*', JSON.stringify(postResponseBody));

            const newAddress = '70 winter walk, USA';
            cy.log(`*--- Updating place with new address: ${newAddress} ---*`);
            cy.request({
                method: 'PUT',
                url: `${baseUrl}/maps/api/place/update/json`,
                qs: { key: 'qaclick123' },
                body: {
                    place_id: placeId,
                    address: newAddress,
                    key: 'qaclick123',
                },
            })
                .then((updateResponse) => {
                    expect(updateResponse.status).to.eq(200);
                    expect(updateResponse.body.msg).to.eq('Address successfully updated');
                    cy.log('*Update successful:*', updateResponse.body.msg);

                    cy.log('*--- Verifying the address update ---*');
                    return cy.request({
                        method: 'GET',
                        url: `${baseUrl}/maps/api/place/get/json`,
                        qs: { key: 'qaclick123', place_id: placeId },
                    });
                })
                .then((getResponse) => {
                    expect(getResponse.status).to.eq(200);
                    expect(getResponse.body.address).to.eq(newAddress);
                    cy.log('*Address successfully verified*');
                    cy.log('*Get Place Response Body:*', JSON.stringify(getResponse.body));

                    cy.log('*--- Deleting the place ---*');
                    return cy.request({
                        method: 'DELETE',
                        url: `${baseUrl}/maps/api/place/delete/json`,
                        body: { place_id: placeId },
                    });
                })
                .then((deleteResponse) => {
                    expect(deleteResponse.status).to.eq(200);
                    expect(deleteResponse.body.status).to.eq('OK');
                    cy.log('*Place successfully deleted*');
                    cy.log('*Delete Place Response Body:*', JSON.stringify(deleteResponse.body));
                });
        });
    });

    it(
        'should add a place using data from a static JSON file',
        { tags: ['@api', '@regression'] },
        () => {
            cy.log('*--- Loading payload from fixture: addPlace.json ---*');
            cy.fixture('addPlace.json').then((payload) => {
                cy.log('*Payload loaded:*', JSON.stringify(payload));
                cy.log('*--- Adding a new place using fixture data ---*');
                cy.request({
                    method: 'POST',
                    url: `${baseUrl}/maps/api/place/add/json`,
                    qs: { key: 'qaclick123' },
                    body: payload,
                    headers: { 'Content-Type': 'application/json' },
                }).then((response) => {
                    cy.log('*Response Body:*', JSON.stringify(response.body));
                    expect(response.status).to.eq(200);
                    expect(response.body.scope).to.eq('APP');
                    expect(response.headers.server).to.eq('Apache/2.4.52 (Ubuntu)');
                    cy.log('*Assertions passed successfully.*');
                });
            });
        },
    );
});
