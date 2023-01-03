import { APIGatewayProxyResult } from 'aws-lambda';

class ResponseHelper {
    success = (message: object | string): APIGatewayProxyResult => ({
        statusCode: 200,
        body: JSON.stringify(message),
    });

    error = (message: string, statusCode: number): APIGatewayProxyResult => ({
        statusCode,
        body: JSON.stringify(message),
    });

    redirect = (Location: string): APIGatewayProxyResult => ({
        statusCode: 302,
        headers: {
            Location,
        },
        body: 'Redirect successfully',
    });
}

export default new ResponseHelper();
