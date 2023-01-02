import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ProjectionType } from 'aws-cdk-lib/aws-dynamodb';
import * as EventInc from '../lib/event-inc-stack';
import { EventIncStack } from '../lib/event-inc-stack';

const initEventInc = (app: cdk.App): EventIncStack => new EventInc.EventIncStack(app, 'MyTestStack', {
    jwtSecretName: 'JWT_SECRET_NAME',
    allowOrigins: ['*'],
});

test('ShortURL DynamoDB Table Created with correct primary key', () => {
    const app = new cdk.App();
    const stack = initEventInc(app);
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'ShortURLTable',
        KeySchema: [
            {
                AttributeName: 'id',
                KeyType: 'HASH',
            },
        ],
    });
});
test('ShortURL DynamoDB Table Created With GSI', () => {
    const app = new cdk.App();
    const stack = initEventInc(app);
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
        GlobalSecondaryIndexes: [
            {
                IndexName: 'url_gsi',
                KeySchema: [
                    {
                        AttributeName: 'url',
                        KeyType: 'HASH',
                    },
                ],
                Projection: {
                    NonKeyAttributes: [
                        'id',
                    ],
                    ProjectionType: ProjectionType.INCLUDE,
                },
            },
        ],
    });
});
test('API Gateway Domain && Route 53RecordSet is created with custom domain name when domainName is passed to stack props', () => {
    const app = new cdk.App();
    const stack = new EventInc.EventIncStack(app, 'MyTestStack', {
        jwtSecretName: 'JWT_SECRET_NAME',
        allowOrigins: ['*'],
        domainName: 'test-domain.com',
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::ApiGatewayV2::DomainName', {
        DomainName: 'api.test-domain.com',
    });
    template.hasResourceProperties('AWS::Route53::RecordSet', {
        Name: 'api.test-domain.com',
    });
});

test('API Gateway domain && Route 53RecordSet is not created when domainName is not passed in stack props', () => {
    const app = new cdk.App();
    const stack = initEventInc(app);
    const template = Template.fromStack(stack);
    const domainResource = template.findResources('AWS::ApiGatewayV2::DomainName', {
        DomainName: 'api.test-domain.com',
    });
    const recordSetResource = template.findResources('AWS::Route53::RecordSet', {
        Name: 'api.test-domain.com',
    });
    expect(domainResource).toEqual({});
    expect(recordSetResource).toEqual({});
});
