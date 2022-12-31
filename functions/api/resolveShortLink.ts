import {APIGatewayEvent, APIGatewayProxyResult, Context} from 'aws-lambda';

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {

    return {
        statusCode: 302,
        headers: {
            Location: 'https://google.com'
        },
        body: 'Redirect successfully.'
    };
};
