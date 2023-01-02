#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { config } from 'dotenv';
import { EventIncStack } from '../lib/event-inc-stack';

config();
const app = new cdk.App();

const jwtSecretName: string = process.env.JWT_SECRET_NAME!;
new EventIncStack(app, 'EventIncStack', {
    hostedZoneName: 'short-link-event-inc.com',
    allowOrigins: ['*'],
    jwtSecretName,
});
