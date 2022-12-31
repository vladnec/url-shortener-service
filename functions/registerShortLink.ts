import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import {nanoid} from "nanoid";
import DynamoDBShortLinkService from "../services/DynamoDBShortLinkService";

const isValidUrl =  (url: string): boolean => {
    try {
        new URL(url);
    } catch (error) {
        console.log ("error is", error);
        return false;
    }
    return true;
}

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return {
            statusCode: 422,
            body: JSON.stringify('Body Required'),
        }
    }
    const body = JSON.parse(event.body)
    const { url } = body
    console.log(body)
    
    if (!url) {
        return {
            statusCode: 422,
            body: JSON.stringify('URL undefined in body'),
        }
    }

    if (!isValidUrl(url)) {
        return {
            statusCode:422,
            body: JSON.stringify('URL is not valid')
        }
    }

    const id = nanoid(8)
    try {
        await new DynamoDBShortLinkService().store({
            id,
            url,
        })
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify(`Failed to saved to DDB with message: ${e}`)
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            shortlink: id
        })
    }

};
