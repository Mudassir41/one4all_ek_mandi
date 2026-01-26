#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EkBharathEkMandiStack } from '../lib/ek-bharath-ek-mandi-stack';

const app = new cdk.App();

// Get environment configuration from context or environment variables
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'development';
const account = app.node.tryGetContext('account') || process.env.CDK_DEFAULT_ACCOUNT;
const region = app.node.tryGetContext('region') || process.env.CDK_DEFAULT_REGION || 'us-east-1';

// Validate environment
const validEnvironments = ['development', 'staging', 'production'];
if (!validEnvironments.includes(environment)) {
  throw new Error(`Invalid environment: ${environment}. Valid environments: ${validEnvironments.join(', ')}`);
}

// Create environment-specific stack
const stackName = `EkBharathEkMandiStack-${environment}`;
new EkBharathEkMandiStack(app, stackName, {
  environment: environment,
  env: {
    account: account,
    region: region,
  },
  description: `Ek Bharath Ek Mandi - Voice-First Cross-State Trading Platform Infrastructure (${environment})`,
  stackName: stackName,
});

// Add comprehensive tags to all resources
cdk.Tags.of(app).add('Project', 'EkBharathEkMandi');
cdk.Tags.of(app).add('Environment', environment);
cdk.Tags.of(app).add('Owner', 'EkBharathEkMandi-Team');
cdk.Tags.of(app).add('ManagedBy', 'CDK');
cdk.Tags.of(app).add('CostCenter', `EkBharath-${environment}`);
cdk.Tags.of(app).add('DeployedAt', new Date().toISOString());

// Environment-specific tags
switch (environment) {
  case 'development':
    cdk.Tags.of(app).add('AutoShutdown', 'true');
    cdk.Tags.of(app).add('BackupRequired', 'false');
    break;
  case 'staging':
    cdk.Tags.of(app).add('AutoShutdown', 'false');
    cdk.Tags.of(app).add('BackupRequired', 'true');
    cdk.Tags.of(app).add('MonitoringLevel', 'standard');
    break;
  case 'production':
    cdk.Tags.of(app).add('AutoShutdown', 'false');
    cdk.Tags.of(app).add('BackupRequired', 'true');
    cdk.Tags.of(app).add('MonitoringLevel', 'enhanced');
    cdk.Tags.of(app).add('ComplianceRequired', 'true');
    break;
}