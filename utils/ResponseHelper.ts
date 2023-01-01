import {APIGatewayProxyResult} from "aws-lambda";

class ResponseHelper {
    success = (message: any): APIGatewayProxyResult => ({
        statusCode: 200,
        body: JSON.stringify(message)
    })
    error = (message: string, statusCode: number): APIGatewayProxyResult => ({
        statusCode,
        body: JSON.stringify(message)
    })
}

export default new ResponseHelper()
