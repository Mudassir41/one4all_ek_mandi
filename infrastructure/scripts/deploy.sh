#!/bin/bash

# Ek Bharath Ek Mandi - Infrastructure Deployment Script

set -e

echo "🚀 Starting Ek Bharath Ek Mandi Infrastructure Deployment..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Get AWS account and region
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_DEFAULT_REGION:-us-east-1}

echo "📋 Deployment Configuration:"
echo "   AWS Account: $AWS_ACCOUNT"
echo "   AWS Region: $AWS_REGION"
echo "   Environment: ${NODE_ENV:-development}"

# Set CDK environment variables
export CDK_DEFAULT_ACCOUNT=$AWS_ACCOUNT
export CDK_DEFAULT_REGION=$AWS_REGION

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Bootstrap CDK if needed
echo "🏗️  Bootstrapping CDK (if needed)..."
npx cdk bootstrap aws://$AWS_ACCOUNT/$AWS_REGION

# Synthesize CloudFormation template
echo "📝 Synthesizing CloudFormation template..."
npx cdk synth

# Deploy the stack
echo "🚀 Deploying infrastructure..."
npx cdk deploy --require-approval never

echo "✅ Infrastructure deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update your frontend environment variables with the output values"
echo "2. Configure your domain and SSL certificates"
echo "3. Set up monitoring and alerting"
echo "4. Deploy your application code"