import { handler } from '../../../src/functions/registerShortLink';
import DynamoDBShortLinkService from '../../../src/services/DynamoDBShortLinkService';
import { generateApiGatewayEvent } from '../../../src/utils/test-utils';
import { ShortLink } from '../../../src/interfaces/ShortLink';

jest.mock('nanoid', () => ({ nanoid: () => '1234' }));

jest.mock('../../../src/services/DynamoDBShortLinkService');

afterEach(() => {
    jest.resetAllMocks();
});

describe('registerShortLink', () => {
    it('returns shortlink ID when URL does not exist in DB', async () => {
        // given
        const payload = {
            url: 'https://google.com',
        };
        const ddbGetShortLinkByURLSpy = jest.spyOn(DynamoDBShortLinkService.prototype, 'getShortLinkByURL')
            .mockImplementation(() => Promise.resolve(null));
        const ddbStoreSpy = jest.spyOn(DynamoDBShortLinkService.prototype, 'store').mockImplementation(() => Promise.resolve());

        // when
        const result = await handler(
            generateApiGatewayEvent(
                '',
                null,
                payload,
                null,
            ),
        );

        // then
        expect(ddbGetShortLinkByURLSpy.mock.calls.length).toEqual(1);
        expect(ddbGetShortLinkByURLSpy.mock.calls[0][0]).toEqual(payload.url);
        expect(ddbStoreSpy.mock.calls.length).toEqual(1);
        expect(ddbStoreSpy.mock.calls[0][0]).toEqual({
            url: payload.url,
            id: '1234',
        });
        expect(result.statusCode).toEqual(200);
    });
    it('returns shortlink ID when URL does  exist in DB', async () => {
        // given
        const payload = {
            url: 'https://google.com',
        };
        const shortLink: ShortLink = {
            url: 'https://google.com',
            id: '1234',
        };

        const ddbGetShortLinkByURLSpy = jest.spyOn(DynamoDBShortLinkService.prototype, 'getShortLinkByURL')
            .mockImplementation(() => Promise.resolve(shortLink));
        const ddbStoreSpy = jest.spyOn(DynamoDBShortLinkService.prototype, 'store');

        // when
        const result = await handler(
            generateApiGatewayEvent(
                '',
                null,
                payload,
                null,
            ),
        );

        // then
        expect(ddbGetShortLinkByURLSpy.mock.calls.length).toEqual(1);
        expect(ddbGetShortLinkByURLSpy.mock.calls[0][0]).toEqual(payload.url);
        expect(ddbStoreSpy.mock.calls.length).toEqual(0);
        expect(result.statusCode).toEqual(200);
    });
    it('throws error when body is undefined', async () => {
        // when
        const result = await handler(
            generateApiGatewayEvent(
                '',
                null,
                null,
                null,
            ),
        );
        expect(result.statusCode).toEqual(422);
        expect(result.body).toEqual(JSON.stringify('Body Required.'));
    });

    it('throws error when url is undefined', async () => {
        // when
        const result = await handler(
            generateApiGatewayEvent(
                '',
                null,
                {
                    randomPayload: '',
                },
                null,
            ),
        );
        expect(result.statusCode).toEqual(422);
        expect(result.body).toEqual(JSON.stringify('URL undefined in body.'));
    });

    it('throws error when url is invalid', async () => {
        // when
        const result = await handler(
            generateApiGatewayEvent(
                '',
                null,
                {
                    url: 'www.google.com',
                },
                null,
            ),
        );
        expect(result.statusCode).toEqual(422);
        expect(result.body).toEqual(JSON.stringify("URL is not valid. URL must start with 'http'."));
    });
    it('throws error when failed to check if URL already exists in DB', async () => {
        // given
        const payload = {
            url: 'https://google.com',
        };
        const errorMessage = 'Error';

        const ddbGetShortLinkByURLSpy = jest.spyOn(DynamoDBShortLinkService.prototype, 'getShortLinkByURL')
            .mockImplementation(() => Promise.reject(errorMessage));
        const ddbStoreSpy = jest.spyOn(DynamoDBShortLinkService.prototype, 'store');

        // when
        const result = await handler(
            generateApiGatewayEvent(
                '',
                null,
                payload,
                null,
            ),
        );

        // then
        expect(ddbGetShortLinkByURLSpy.mock.calls.length).toEqual(1);
        expect(ddbGetShortLinkByURLSpy.mock.calls[0][0]).toEqual(payload.url);
        expect(ddbStoreSpy.mock.calls.length).toEqual(0);
        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(JSON.stringify(`Failed to check if url already exists in DDB to DDB with message: ${errorMessage}`));
    });
    it('throws error when short-link failed to save to DDB', async () => {
        // given
        const errorMessage = 'DDBError';
        const payload = {
            url: 'https://google.com',
        };
        const ddbGetShortLinkByURLSpy = jest.spyOn(DynamoDBShortLinkService.prototype, 'getShortLinkByURL')
            .mockImplementation(() => Promise.resolve(null));
        const ddbStoreSpy = jest.spyOn(DynamoDBShortLinkService.prototype, 'store').mockImplementation(() => Promise.reject(errorMessage));

        // when
        const result = await handler(
            generateApiGatewayEvent(
                '',
                null,
                payload,
                null,
            ),
        );

        // then
        expect(ddbGetShortLinkByURLSpy.mock.calls.length).toEqual(1);
        expect(ddbStoreSpy.mock.calls[0][0]).toEqual({
            url: payload.url,
            id: '1234',
        });
        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(JSON.stringify(`Failed to save short-link to DDB with message: ${errorMessage}`));
    });
});
