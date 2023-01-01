#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EventIncStack } from '../lib/event-inc-stack';

const app = new cdk.App();
new EventIncStack(app, 'EventIncStack', {
    hostedZoneName: 'short-link-event-inc.com',
    allowOrigins: ['*'],
});
