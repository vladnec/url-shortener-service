import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import ResponseHelper from '../utils/ResponseHelper';
import DynamoDBShortLinkService from '../services/DynamoDBShortLinkService';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.pathParameters || !event.pathParameters.id) {
        return ResponseHelper.error('Could not find an ID in path.', 422);
    }

    const { id } = event.pathParameters;

    try {
        const shortLink = await new DynamoDBShortLinkService().getShortLinkById(id);
        if (!shortLink) {
            return ResponseHelper.error(`Could not find redirect url for ID: ${id}.`, 404);
        }
        return ResponseHelper.redirect(shortLink.url);
    } catch (e) {
        return ResponseHelper.error(`Error while fetching redirect url from DDB with message: ${e}`, 500);
    }
};
