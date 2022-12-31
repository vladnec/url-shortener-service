import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import {nanoid} from "nanoid";

export type TypedJsonAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: S }
interface RegisterURLRequest {
    url: string;
}

const isValidUrl =  (url: string): boolean => {
    try {
        new URL(url);
    } catch (error) {
        console.log ("error is", error);
        return false;
    }
    return true;
}

export const handler = async (event: TypedJsonAPIGatewayProxyEvent<RegisterURLRequest>, context: Context): Promise<APIGatewayProxyResult> => {
    console.log(JSON.stringify(event.body))
    if (!event.body) {
        return {
            statusCode: 422,
            body: JSON.stringify('Body Required'),
        }
    }
    const { body} = event
    console.log(JSON.stringify(body))
    if (!body.url) {
        return {
            statusCode: 422,
            body: JSON.stringify('URL undefined in body'),
        }
    }
    const { url } = body
    if (!isValidUrl(url)) {
        return {
            statusCode:422,
            body: JSON.stringify('URL is not valid')
        }
    }

    const id = nanoid(8)

    return {
        statusCode: 200,
        body: JSON.stringify({
            shortlink: id
        })
    }

};
