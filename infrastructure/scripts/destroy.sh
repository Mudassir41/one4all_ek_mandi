#!/bin/bash

# Ek Bharath Ek Mandi - Infrastructure Destruction Script

set -e

echo "🗑️  Starting Ek Bharath Ek Mandi Infrastructure Destruction..."

# Confirmation prompt
read -p "⚠️  Are you sure you want to destroy the infrastructure? This action cannot be undone. (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Destruction cancelled."
    exit 0
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Get AWS account and region
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_DEFAULT_REGION:-us-east-1}

echo "📋 Destruction Configuration:"
echo "   AWS Account: $AWS_ACCOUNT"
echo "   AWS Region: $AWS_REGION"

# Set CDK environment variables
export CDK_DEFAULT_ACCOUNT=$AWS_ACCOUNT
export CDK_DEFAULT_REGION=$AWS_REGION

# Empty S3 buckets first (required for deletion)
echo "🗑️  Emptying S3 buckets..."
MEDIA_BUCKET="ek-bharath-media-$AWS_ACCOUNT-$AWS_REGION"
VOICE_BUCKET="ek-bharath-voice-$AWS_ACCOUNT-$AWS_REGION"

aws s3 rm s3://$MEDIA_BUCKET --recursive --quiet || echo "Media bucket not found or already empty"
aws s3 rm s3://$VOICE_BUCKET --recursive --quiet || echo "Voice bucket not found or already empty"

# Destroy the stack
echo "🗑️  Destroying infrastructure..."
npx cdk destroy --force

echo "✅ Infrastructure destruction completed successfully!"