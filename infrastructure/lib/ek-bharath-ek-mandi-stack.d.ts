import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
export declare class EkBharathEkMandiStack extends cdk.Stack {
    readonly usersTable: dynamodb.Table;
    readonly productsTable: dynamodb.Table;
    readonly bidsTable: dynamodb.Table;
    readonly conversationsTable: dynamodb.Table;
    readonly priceHistoryTable: dynamodb.Table;
    readonly translationCacheTable: dynamodb.Table;
    readonly userSessionsTable: dynamodb.Table;
    readonly mediaBucket: s3.Bucket;
    readonly voiceBucket: s3.Bucket;
    readonly api: apigateway.RestApi;
    readonly userPool: cognito.UserPool;
    constructor(scope: Construct, id: string, props?: cdk.StackProps);
    private createDynamoDBTables;
    private createS3Buckets;
    private createElastiCache;
    private createOpenSearch;
    private createCognitoUserPool;
    private createApiGateway;
    private createLambdaFunctions;
    private createCloudFrontDistribution;
    private createOutputs;
}
