import { handler } from '../../../src/functions/resolveShortLink';
import { generateApiGatewayEvent } from '../../../src/utils/test-utils';
import DynamoDBShortLinkService from '../../../src/services/DynamoDBShortLinkService';
import { ShortLink } from '../../../src/interfaces/ShortLink';

jest.mock('../../../src/services/DynamoDBShortLinkService');

afterEach(() => {
    jest.resetAllMocks();
});

describe('resolveShortLink', () => {
    it('redirects successfully to URL stored in DB', async () => {
        // given
        const pathParameters = {
            id: '1234',
        };
        const shortLink: ShortLink = {
            url: 'https://google.com',
            id: '1234',
        };
        const ddbGetShortLinkByIdSpy = jest.spyOn(DynamoDBShortLinkService.prototype, 'getShortLinkById')
            .mockImplementation(() => Promise.resolve(shortLink));

        // when
        const result = await handler(
            generateApiGatewayEvent(
                '',
                pathParameters,
                null,
                null,
            ),
        );

        // then
        expect(ddbGetShortLinkByIdSpy.mock.calls.length).toEqual(1);
        expect(ddbGetShortLinkByIdSpy.mock.calls[0][0]).toEqual(pathParameters.id);
        expect(result.statusCode).toEqual(302);
        expect(result.headers?.Location).toEqual(shortLink.url);
    });

    it('returns error when pathParameters is undefined', async () => {
        // given
        const ddbGetShortLinkByIdSpy = jest.spyOn(DynamoDBShortLinkService.prototype, 'getShortLinkById')
            .mockImplementation(() => Promise.resolve(null));

        // when
        const result = await handler(
            generateApiGatewayEvent(
                '',
                null,
                null,
                null,
            ),
        );

        // then
        expect(ddbGetShortLinkByIdSpy.mock.calls.length).toEqual(0);
        expect(result.statusCode).toEqual(422);
        expect(result.body).toEqual(JSON.stringify('Could not find an ID in path.'));
    });

    it('returns error when id is not defined in pathParameters', async () => {
        // given
        const ddbGetShortLinkByIdSpy = jest.spyOn(DynamoDBShortLinkService.prototype, 'getShortLinkById')
            .mockImplementation(() => Promise.resolve(null));

        // when
        const result = await handler(
            generateApiGatewayEvent(
                '',
                {},
                null,
                null,
            ),
        );

        // then
        expect(ddbGetShortLinkByIdSpy.mock.calls.length).toEqual(0);
        expect(result.statusCode).toEqual(422);
        expect(result.body).toEqual(JSON.stringify('Could not find an ID in path.'));
    });

    it('returns error when short link could not be found in DDB', async () => {
        // given
        const pathParameters = {
            id: '1234',
        };
        const ddbGetShortLinkByIdSpy = jest.spyOn(DynamoDBShortLinkService.prototype, 'getShortLinkById')
            .mockImplementation(() => Promise.resolve(null));

        // when
        const result = await handler(
            generateApiGatewayEvent(
                '',
                pathParameters,
                null,
                null,
            ),
        );

        // then
        expect(ddbGetShortLinkByIdSpy.mock.calls.length).toEqual(1);
        expect(result.statusCode).toEqual(404);
        expect(result.body).toEqual(JSON.stringify(`Could not find redirect url for ID: ${pathParameters.id}.`));
    });

    it('returns error when DDB fails to fetch short-link', async () => {
        // given
        const ddbErrorMessage = 'Error';
        const pathParameters = {
            id: '1234',
        };
        const ddbGetShortLinkByIdSpy = jest.spyOn(DynamoDBShortLinkService.prototype, 'getShortLinkById')
            .mockImplementation(() => Promise.reject(ddbErrorMessage));

        // when
        const result = await handler(
            generateApiGatewayEvent(
                '',
                pathParameters,
                null,
                null,
            ),
        );

        // then
        expect(ddbGetShortLinkByIdSpy.mock.calls.length).toEqual(1);
        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(JSON.stringify(`Error while fetching redirect url from DDB with message: ${ddbErrorMessage}`));
    });
});
