import { APIGatewayProxyEvent, APIGatewayProxyEventPathParameters, APIGatewayProxyEventQueryStringParameters } from 'aws-lambda';

const generateApiGatewayEvent = (
    path: string,
    pathParameters: APIGatewayProxyEventPathParameters | null = null,
    body: string | object | null = null,
    queryStringParameters: APIGatewayProxyEventQueryStringParameters | null = null,
): APIGatewayProxyEvent => ({
    body: body ? JSON.stringify(body) : null,
    headers: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    multiValueHeaders: {},
    path,
    pathParameters,
    queryStringParameters,
    multiValueQueryStringParameters: null,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    requestContext: {},
});

export {
    generateApiGatewayEvent,
};
