import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {nanoid} from "nanoid";
import DynamoDBShortLinkService from "../services/DynamoDBShortLinkService";
import ResponseHelper from "../utils/ResponseHelper";

const isValidUrl =  (url: string): boolean => {
    try {
        new URL(url);
    } catch (error) {
        console.log(error)
        return false;
    }
    return true;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return ResponseHelper.error('Body Required.',422)
    }

    const body = JSON.parse(event.body)
    const { url } = body

    if (!url) {
        return ResponseHelper.error('URL undefined in body.', 422)
    }
    if (!isValidUrl(url)) {
        return ResponseHelper.error("URL is not valid. URL must start with 'http'.", 422)
    }

    const id = nanoid(8)
    try {
        await new DynamoDBShortLinkService().store({
            id,
            url,
        })
    } catch (e) {
        return ResponseHelper.error(
            `Failed to save short-link to DDB with message: ${e}`,
            500
        )
    }

    return ResponseHelper.success({
        shortlink: id
    })
};
