#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PracticeStack } from '../lib/practice-stack';
import config from 'config';

const app = new cdk.App();
new PracticeStack(app, 'PracticeStack', {
  env: { account: config.get('deployment.account'), region: config.get('deployment.region') },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});