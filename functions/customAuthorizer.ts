import jwt from 'jsonwebtoken';
import {
    APIGatewayTokenAuthorizerEvent, AuthResponse, Callback, Context, PolicyDocument, 
} from 'aws-lambda';
import { Effect } from 'aws-cdk-lib/aws-iam';
import SecretsManagerService from '../services/SecretsManagerService';

function generatePolicyDocument(effect, methodArn): PolicyDocument {
    return {
        Version: '2012-10-17',
        Statement: [
            {
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: methodArn,
            },
        ],
    };
}

function generateAuthResponse(principalId, effect: Effect, methodArn: string): AuthResponse {
    const policyDocument = generatePolicyDocument(effect, methodArn);

    return {
        principalId,
        policyDocument,
    };
}

export const handler = async (event: APIGatewayTokenAuthorizerEvent, context: Context, callback: Callback) => {
    const token = event.authorizationToken.replace('Bearer ', '');
    const { methodArn } = event;
    if (!token || !methodArn) {
        console.error('AUTH: No token in bearer');
        return callback('Unauthorized');
    }
    const jwtSecretName = process.env.JWT_SECRET_NAME;
    if (!jwtSecretName) {
        console.error('AUTH: No ENV_VARIBLE JWT_SECRET_NAME set.');
        return callback('Unauthorized');
    }

    try {
        const secret = await new SecretsManagerService('eu-central-1').getSecret(jwtSecretName);
        const decoded = jwt.verify(token, secret);
        if (decoded) {
            return callback(null, generateAuthResponse('user', Effect.ALLOW, methodArn));
        }
        return callback(null, generateAuthResponse('user', Effect.DENY, methodArn));
    } catch (err) {
        console.error(err);
        return callback('Unauthorized');
    }
};
