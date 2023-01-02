const generatePolicyDocument = (effect, methodArn) => {
    if (!effect || !methodArn) return null;

    return {
        Version: '2012-10-17',
        Statement: [{
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: methodArn,
        }],
    };
};

const generateAuthResponse = (principalId, effect, methodArn) => {
    const policyDocument = generatePolicyDocument(effect, methodArn);

    return {
        principalId,
        policyDocument,
    };
};

export const handler = async (event) => {
    const token = event.authorizationToken.toLowerCase();
    const { methodArn } = event;

    switch (token) {
        case 'allow':
            return generateAuthResponse('user', 'Allow', methodArn);
        default:
            return generateAuthResponse('user', 'Deny', methodArn);
    }
};
