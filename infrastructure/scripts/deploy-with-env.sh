#!/bin/bash

# Ek Bharath Ek Mandi - Environment-Specific Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="development"
REGION="us-east-1"
ACCOUNT=""
SKIP_SECRETS_SETUP=false
FORCE_DEPLOY=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy Ek Bharath Ek Mandi infrastructure with environment-specific configuration.

OPTIONS:
    -e, --environment ENVIRONMENT    Target environment (development, staging, production)
    -r, --region REGION             AWS region (default: us-east-1)
    -a, --account ACCOUNT           AWS account ID
    -s, --skip-secrets              Skip secrets setup (use existing secrets)
    -f, --force                     Force deployment without confirmation
    -h, --help                      Show this help message

EXAMPLES:
    $0 --environment development
    $0 --environment production --region us-west-2 --account 123456789012
    $0 --environment staging --skip-secrets

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -a|--account)
            ACCOUNT="$2"
            shift 2
            ;;
        -s|--skip-secrets)
            SKIP_SECRETS_SETUP=true
            shift
            ;;
        -f|--force)
            FORCE_DEPLOY=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    print_error "Valid environments: development, staging, production"
    exit 1
fi

# Get AWS account ID if not provided
if [[ -z "$ACCOUNT" ]]; then
    print_status "Getting AWS account ID..."
    ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "")
    if [[ -z "$ACCOUNT" ]]; then
        print_error "Could not determine AWS account ID. Please provide it with --account option."
        exit 1
    fi
fi

print_status "Deployment Configuration:"
echo "  Environment: $ENVIRONMENT"
echo "  Region: $REGION"
echo "  Account: $ACCOUNT"
echo "  Skip Secrets: $SKIP_SECRETS_SETUP"
echo ""

# Confirmation for production
if [[ "$ENVIRONMENT" == "production" && "$FORCE_DEPLOY" != true ]]; then
    print_warning "You are about to deploy to PRODUCTION environment!"
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_status "Deployment cancelled."
        exit 0
    fi
fi

# Set environment variables
export CDK_DEFAULT_ACCOUNT="$ACCOUNT"
export CDK_DEFAULT_REGION="$REGION"
export ENVIRONMENT="$ENVIRONMENT"

# Check if AWS CLI is configured
print_status "Checking AWS CLI configuration..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    print_error "AWS CLI is not configured or credentials are invalid."
    print_error "Please run 'aws configure' or set up your AWS credentials."
    exit 1
fi

# Check if CDK is installed
print_status "Checking CDK installation..."
if ! command -v cdk &> /dev/null; then
    print_error "AWS CDK is not installed."
    print_error "Please install it with: npm install -g aws-cdk"
    exit 1
fi

# Bootstrap CDK if needed
print_status "Checking CDK bootstrap status..."
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region "$REGION" > /dev/null 2>&1; then
    print_status "Bootstrapping CDK for account $ACCOUNT in region $REGION..."
    cdk bootstrap aws://$ACCOUNT/$REGION
    print_success "CDK bootstrap completed."
else
    print_status "CDK already bootstrapped."
fi

# Build Lambda functions
print_status "Building Lambda functions..."
if [[ -f "scripts/build-lambdas.sh" ]]; then
    chmod +x scripts/build-lambdas.sh
    ./scripts/build-lambdas.sh
    print_success "Lambda functions built successfully."
else
    print_warning "Lambda build script not found. Skipping Lambda build."
fi

# Install dependencies
print_status "Installing CDK dependencies..."
npm install

# Synthesize the stack first to check for errors
print_status "Synthesizing CDK stack..."
cdk synth EkBharathEkMandiStack-$ENVIRONMENT

# Deploy the stack
print_status "Deploying infrastructure..."
cdk deploy EkBharathEkMandiStack-$ENVIRONMENT \
    --context environment=$ENVIRONMENT \
    --context region=$REGION \
    --context account=$ACCOUNT \
    --require-approval never \
    --outputs-file "outputs-$ENVIRONMENT.json"

if [[ $? -eq 0 ]]; then
    print_success "Infrastructure deployment completed successfully!"
else
    print_error "Infrastructure deployment failed!"
    exit 1
fi

# Setup secrets if not skipped
if [[ "$SKIP_SECRETS_SETUP" != true ]]; then
    print_status "Setting up secrets in AWS Secrets Manager..."
    
    # Check if secrets setup script exists
    if [[ -f "scripts/setup-secrets.sh" ]]; then
        chmod +x scripts/setup-secrets.sh
        ./scripts/setup-secrets.sh --environment "$ENVIRONMENT" --region "$REGION"
        print_success "Secrets setup completed."
    else
        print_warning "Secrets setup script not found. You may need to manually configure secrets."
    fi
fi

# Validate deployment
print_status "Validating deployment..."
if [[ -f "scripts/validate.sh" ]]; then
    chmod +x scripts/validate.sh
    ./scripts/validate.sh --environment "$ENVIRONMENT"
    if [[ $? -eq 0 ]]; then
        print_success "Deployment validation passed!"
    else
        print_warning "Deployment validation failed. Please check the logs."
    fi
else
    print_warning "Validation script not found. Skipping validation."
fi

# Display deployment outputs
print_status "Deployment outputs:"
if [[ -f "outputs-$ENVIRONMENT.json" ]]; then
    cat "outputs-$ENVIRONMENT.json" | jq '.'
else
    print_warning "Outputs file not found."
fi

# Generate environment file
print_status "Generating environment configuration file..."
cat > ".env.$ENVIRONMENT" << EOF
# Generated environment configuration for $ENVIRONMENT
# Generated on: $(date)

# Environment Configuration
NODE_ENV=$ENVIRONMENT
ENVIRONMENT=$ENVIRONMENT
AWS_REGION=$REGION
CDK_DEFAULT_ACCOUNT=$ACCOUNT
CDK_DEFAULT_REGION=$REGION

# AWS Secrets Manager ARNs
JWT_SECRET_ARN=arn:aws:secretsmanager:$REGION:$ACCOUNT:secret:ek-bharath/$ENVIRONMENT/jwt-secret
ENCRYPTION_KEY_ARN=arn:aws:secretsmanager:$REGION:$ACCOUNT:secret:ek-bharath/$ENVIRONMENT/encryption-key
EXTERNAL_API_KEYS_ARN=arn:aws:secretsmanager:$REGION:$ACCOUNT:secret:ek-bharath/$ENVIRONMENT/external-api-keys
AI_SERVICE_KEYS_ARN=arn:aws:secretsmanager:$REGION:$ACCOUNT:secret:ek-bharath/$ENVIRONMENT/ai-service-keys
DATABASE_CREDENTIALS_ARN=arn:aws:secretsmanager:$REGION:$ACCOUNT:secret:ek-bharath/$ENVIRONMENT/database-credentials

# SSM Parameter Store Configuration
CONFIG_PARAMETER_PREFIX=/ek-bharath/$ENVIRONMENT

# Feature Flags (environment-specific)
EOF

# Add environment-specific feature flags
case $ENVIRONMENT in
    development)
        cat >> ".env.$ENVIRONMENT" << EOF
FEATURE_VOICE_TRANSLATION=true
FEATURE_REAL_TIME_CHAT=true
FEATURE_PRICE_DISCOVERY=true
FEATURE_OFFLINE_MODE=false
FEATURE_PAYMENT_GATEWAY=false
FEATURE_ADVANCED_ANALYTICS=false
FEATURE_MULTI_REGION=false
LOG_LEVEL=DEBUG
ENABLE_XRAY=false
EOF
        ;;
    staging)
        cat >> ".env.$ENVIRONMENT" << EOF
FEATURE_VOICE_TRANSLATION=true
FEATURE_REAL_TIME_CHAT=true
FEATURE_PRICE_DISCOVERY=true
FEATURE_OFFLINE_MODE=false
FEATURE_PAYMENT_GATEWAY=false
FEATURE_ADVANCED_ANALYTICS=true
FEATURE_MULTI_REGION=false
LOG_LEVEL=INFO
ENABLE_XRAY=true
EOF
        ;;
    production)
        cat >> ".env.$ENVIRONMENT" << EOF
FEATURE_VOICE_TRANSLATION=true
FEATURE_REAL_TIME_CHAT=true
FEATURE_PRICE_DISCOVERY=true
FEATURE_OFFLINE_MODE=false
FEATURE_PAYMENT_GATEWAY=true
FEATURE_ADVANCED_ANALYTICS=true
FEATURE_MULTI_REGION=true
LOG_LEVEL=WARN
ENABLE_XRAY=true
EOF
        ;;
esac

print_success "Environment configuration file created: .env.$ENVIRONMENT"

# Final instructions
print_success "Deployment completed successfully!"
echo ""
print_status "Next steps:"
echo "1. Copy the generated .env.$ENVIRONMENT file to your application"
echo "2. Update the secrets in AWS Secrets Manager with actual values"
echo "3. Test the deployment using the validation script"
echo "4. Monitor the application logs and metrics"
echo ""
print_status "Useful commands:"
echo "  View stack outputs: cdk outputs EkBharathEkMandiStack-$ENVIRONMENT"
echo "  View stack resources: aws cloudformation describe-stack-resources --stack-name EkBharathEkMandiStack-$ENVIRONMENT"
echo "  Update secrets: aws secretsmanager update-secret --secret-id ek-bharath/$ENVIRONMENT/jwt-secret --secret-string '{\"secret\":\"new-value\"}'"
echo ""