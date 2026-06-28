import { faker } from '@faker-js/faker';
import { AddPlace, Location, UpdatePlace } from '../../types/api.types';

describe('Verify google API', { tags: '@api' }, () => {
    const env = Cypress.config('env') as Record<string, string>;
    const baseUrl: string = env['baseurl'];
    let addPlacePayload: AddPlace;
    let placeId: string;
    let updatePayload: UpdatePlace;

    beforeEach(() => {
        const location: Location = {
            lat: faker.location.latitude(),
            lng: faker.location.longitude(),
        };
        addPlacePayload = {
            location: location,
            accuracy: 50,
            name: faker.person.firstName(),
            phone_number: faker.phone.number(),
            address: faker.location.streetAddress(),
            types: ['shoe park', 'shop'],
            website: faker.internet.url(),
            language: 'French-IN',
        };
    });

    it('1. Create - should add a new place', { tags: ['@api', '@smoke'] }, () => {
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

            placeId = response.body.place_id;

            // Generate update payload to be used in next test
            updatePayload = {
                place_id: placeId,
                address: faker.location.streetAddress(),
                key: 'qaclick123',
            };
        });
    });

    it('2. Update - should update the place address', { tags: ['@api', '@smoke'] }, () => {
        expect(placeId, 'Place ID from Create step').to.exist;

        cy.request({
            method: 'PUT',
            url: `${baseUrl}/maps/api/place/update/json`,
            qs: { key: 'qaclick123' },
            body: updatePayload,
        }).then((updateResponse) => {
            expect(updateResponse.status).to.eq(200);
            expect(updateResponse.body.msg).to.eq('Address successfully updated');
        });
    });

    it(
        '3. Read - should get the place and verify the address update',
        { tags: ['@api', '@smoke'] },
        () => {
            expect(placeId, 'Place ID from Create step').to.exist;

            cy.request({
                method: 'GET',
                url: `${baseUrl}/maps/api/place/get/json`,
                qs: { key: 'qaclick123', place_id: placeId },
            }).then((getResponse) => {
                expect(getResponse.status).to.eq(200);
                expect(getResponse.body.address).to.eq(updatePayload.address);
            });
        },
    );

    it('4. Delete - should delete the place', { tags: ['@api', '@smoke'] }, () => {
        expect(placeId, 'Place ID from Create step').to.exist;

        cy.request({
            method: 'DELETE',
            url: `${baseUrl}/maps/api/place/delete/json`,
            body: { place_id: placeId },
        }).then((deleteResponse) => {
            expect(deleteResponse.status).to.eq(200);
            expect(deleteResponse.body.status).to.eq('OK');
        });
    });

    it(
        'should add a place using data from a static JSON file',
        { tags: ['@api', '@regression'] },
        () => {
            cy.fixture('addPlace.json').then((payload) => {
                cy.request({
                    method: 'POST',
                    url: `${baseUrl}/maps/api/place/add/json`,
                    qs: { key: 'qaclick123' },
                    body: payload,
                    headers: { 'Content-Type': 'application/json' },
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body.scope).to.eq('APP');
                    expect(response.headers.server).to.eq('Apache/2.4.52 (Ubuntu)');
                });
            });
        },
    );
});
