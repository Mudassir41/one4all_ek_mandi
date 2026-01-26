export interface EnvironmentConfig {
    name: string;
    account?: string;
    region: string;
    dynamodb: {
        billingMode: 'PAY_PER_REQUEST' | 'PROVISIONED';
        pointInTimeRecovery: boolean;
        encryption: boolean;
    };
    s3: {
        versioning: boolean;
        lifecycleRules: boolean;
        encryption: boolean;
    };
    elasticache: {
        nodeType: string;
        numNodes: number;
    };
    opensearch: {
        instanceType: string;
        instanceCount: number;
        ebsVolumeSize: number;
    };
    lambda: {
        timeout: number;
        memorySize: number;
    };
    monitoring: {
        enableXRay: boolean;
        enableCloudWatch: boolean;
        logRetention: number;
    };
}
export declare const environments: Record<string, EnvironmentConfig>;
export declare function getEnvironmentConfig(env?: string): EnvironmentConfig;
