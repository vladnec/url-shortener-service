import {APIGatewayEvent, APIGatewayProxyResult, Context} from 'aws-lambda';

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);
    console.log('stageURL', process.env.SHORT_LINK_STAGE_URL);
    return {
        statusCode: 302,
        headers: {
            Location: 'https://google.com'
        },
        body: 'Redirect successfully.'
    };
};
