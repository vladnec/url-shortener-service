import { handler } from '../../functions/registerShortLink';
import { generateApiGatewayEvent } from '../../utils/TestUtils';
import DynamoDBShortLinkService from '../../services/DynamoDBShortLinkService';

jest.mock('nanoid', () => ({ nanoid: () => '1234' }));

jest.mock('../../services/DynamoDBShortLinkService');

afterEach(() => {
    jest.resetAllMocks();
});

describe('registerShortLink', () => {
    it('returns short URL', async () => {
        // given
        const payload = {
            url: 'https://google.com',
        };
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
        expect(ddbStoreSpy.mock.calls.length).toEqual(1);
        expect(ddbStoreSpy.mock.calls[0][0]).toEqual({
            url: payload.url,
            id: '1234',
        });
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

    it('throws error when short-link failed to save to DDB', async () => {
        // given
        const errorMessage = 'DDBError';
        const payload = {
            url: 'https://google.com',
        };
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
        expect(ddbStoreSpy.mock.calls[0][0]).toEqual({
            url: payload.url,
            id: '1234',
        });
        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(JSON.stringify(`Failed to save short-link to DDB with message: ${errorMessage}`));
    });
});
