export interface EnvironmentConfig {
  name: string;
  account?: string;
  region: string;
  
  // DynamoDB Configuration
  dynamodb: {
    billingMode: 'PAY_PER_REQUEST' | 'PROVISIONED';
    pointInTimeRecovery: boolean;
    encryption: boolean;
  };
  
  // S3 Configuration
  s3: {
    versioning: boolean;
    lifecycleRules: boolean;
    encryption: boolean;
  };
  
  // ElastiCache Configuration
  elasticache: {
    nodeType: string;
    numNodes: number;
  };
  
  // OpenSearch Configuration
  opensearch: {
    instanceType: string;
    instanceCount: number;
    ebsVolumeSize: number;
  };
  
  // Lambda Configuration
  lambda: {
    timeout: number;
    memorySize: number;
  };
  
  // Monitoring
  monitoring: {
    enableXRay: boolean;
    enableCloudWatch: boolean;
    logRetention: number;
  };
}

export const environments: Record<string, EnvironmentConfig> = {
  development: {
    name: 'development',
    region: 'us-east-1',
    
    dynamodb: {
      billingMode: 'PAY_PER_REQUEST',
      pointInTimeRecovery: false,
      encryption: true,
    },
    
    s3: {
      versioning: false,
      lifecycleRules: true,
      encryption: true,
    },
    
    elasticache: {
      nodeType: 'cache.t3.micro',
      numNodes: 1,
    },
    
    opensearch: {
      instanceType: 't3.small.search',
      instanceCount: 1,
      ebsVolumeSize: 20,
    },
    
    lambda: {
      timeout: 30,
      memorySize: 256,
    },
    
    monitoring: {
      enableXRay: false,
      enableCloudWatch: true,
      logRetention: 7,
    },
  },
  
  staging: {
    name: 'staging',
    region: 'us-east-1',
    
    dynamodb: {
      billingMode: 'PAY_PER_REQUEST',
      pointInTimeRecovery: true,
      encryption: true,
    },
    
    s3: {
      versioning: true,
      lifecycleRules: true,
      encryption: true,
    },
    
    elasticache: {
      nodeType: 'cache.t3.small',
      numNodes: 1,
    },
    
    opensearch: {
      instanceType: 't3.medium.search',
      instanceCount: 2,
      ebsVolumeSize: 50,
    },
    
    lambda: {
      timeout: 60,
      memorySize: 512,
    },
    
    monitoring: {
      enableXRay: true,
      enableCloudWatch: true,
      logRetention: 30,
    },
  },
  
  production: {
    name: 'production',
    region: 'us-east-1',
    
    dynamodb: {
      billingMode: 'PAY_PER_REQUEST',
      pointInTimeRecovery: true,
      encryption: true,
    },
    
    s3: {
      versioning: true,
      lifecycleRules: true,
      encryption: true,
    },
    
    elasticache: {
      nodeType: 'cache.r6g.large',
      numNodes: 2,
    },
    
    opensearch: {
      instanceType: 'r6g.large.search',
      instanceCount: 3,
      ebsVolumeSize: 100,
    },
    
    lambda: {
      timeout: 300,
      memorySize: 1024,
    },
    
    monitoring: {
      enableXRay: true,
      enableCloudWatch: true,
      logRetention: 90,
    },
  },
};

export function getEnvironmentConfig(env: string = 'development'): EnvironmentConfig {
  const config = environments[env];
  if (!config) {
    throw new Error(`Environment configuration not found for: ${env}`);
  }
  return config;
}