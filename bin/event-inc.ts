#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { config } from 'dotenv';
import { EventIncStack } from '../lib/event-inc-stack';

config();
const app = new cdk.App();

new EventIncStack(app, 'EventIncStack', {
    allowOrigins: process.env.ALLOWED_ORIGINS!.split(','),
    jwtSecretName: process.env.JWT_SECRET_NAME!,
    domainName: process.env.DOMAIN_NAME,
    env: {
        account: process.env.CDK_ACCOUNT!,
        region: process.env.CDK_REGION!,
    },
});
