#!/bin/bash

# Ek Bharath Ek Mandi - Infrastructure Validation Script

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
VERBOSE=false

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

print_verbose() {
    if [[ "$VERBOSE" == true ]]; then
        echo -e "${BLUE}[VERBOSE]${NC} $1"
    fi
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Validate Ek Bharath Ek Mandi infrastructure deployment.

OPTIONS:
    -e, --environment ENVIRONMENT    Target environment (development, staging, production)
    -r, --region REGION             AWS region (default: us-east-1)
    -v, --verbose                   Enable verbose output
    -h, --help                      Show this help message

EXAMPLES:
    $0 --environment development
    $0 --environment production --region us-west-2 --verbose

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
        -v|--verbose)
            VERBOSE=true
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

print_status "Validating infrastructure for environment: $ENVIRONMENT in region: $REGION"

# Initialize counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Function to run a validation check
run_check() {
    local check_name="$1"
    local check_command="$2"
    local is_critical="${3:-true}"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    print_verbose "Running check: $check_name"
    
    if eval "$check_command" > /dev/null 2>&1; then
        print_success "✓ $check_name"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        if [[ "$is_critical" == "true" ]]; then
            print_error "✗ $check_name"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        else
            print_warning "⚠ $check_name"
            WARNING_CHECKS=$((WARNING_CHECKS + 1))
        fi
        return 1
    fi
}

# Function to check if AWS resource exists
check_aws_resource() {
    local resource_type="$1"
    local resource_name="$2"
    local check_command="$3"
    
    run_check "$resource_type: $resource_name" "$check_command"
}

# Get stack name
STACK_NAME="EkBharathEkMandiStack-$ENVIRONMENT"

print_status "Checking CloudFormation stack..."
run_check "CloudFormation Stack Exists" "aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION"

if [[ $? -eq 0 ]]; then
    # Get stack outputs
    print_status "Retrieving stack outputs..."
    STACK_OUTPUTS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs' --output json 2>/dev/null || echo "[]")
    
    # Extract resource names from outputs
    API_GATEWAY_URL=$(echo "$STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey=="ApiGatewayUrl") | .OutputValue' 2>/dev/null || echo "")
    USER_POOL_ID=$(echo "$STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey=="UserPoolId") | .OutputValue' 2>/dev/null || echo "")
    USERS_TABLE=$(echo "$STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey=="UsersTableName") | .OutputValue' 2>/dev/null || echo "")
    PRODUCTS_TABLE=$(echo "$STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey=="ProductsTableName") | .OutputValue' 2>/dev/null || echo "")
    MEDIA_BUCKET=$(echo "$STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey=="MediaBucketName") | .OutputValue' 2>/dev/null || echo "")
    VOICE_BUCKET=$(echo "$STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey=="VoiceBucketName") | .OutputValue' 2>/dev/null || echo "")
    
    print_verbose "Stack outputs retrieved successfully"
else
    print_error "Cannot retrieve stack outputs. Skipping resource validation."
    exit 1
fi

# Validate DynamoDB Tables
print_status "Validating DynamoDB tables..."
if [[ -n "$USERS_TABLE" ]]; then
    check_aws_resource "DynamoDB Table" "$USERS_TABLE" "aws dynamodb describe-table --table-name $USERS_TABLE --region $REGION"
fi
if [[ -n "$PRODUCTS_TABLE" ]]; then
    check_aws_resource "DynamoDB Table" "$PRODUCTS_TABLE" "aws dynamodb describe-table --table-name $PRODUCTS_TABLE --region $REGION"
fi

# Validate S3 Buckets
print_status "Validating S3 buckets..."
if [[ -n "$MEDIA_BUCKET" ]]; then
    check_aws_resource "S3 Bucket" "$MEDIA_BUCKET" "aws s3api head-bucket --bucket $MEDIA_BUCKET --region $REGION"
fi
if [[ -n "$VOICE_BUCKET" ]]; then
    check_aws_resource "S3 Bucket" "$VOICE_BUCKET" "aws s3api head-bucket --bucket $VOICE_BUCKET --region $REGION"
fi

# Validate Cognito User Pool
print_status "Validating Cognito User Pool..."
if [[ -n "$USER_POOL_ID" ]]; then
    check_aws_resource "Cognito User Pool" "$USER_POOL_ID" "aws cognito-idp describe-user-pool --user-pool-id $USER_POOL_ID --region $REGION"
fi

# Validate API Gateway
print_status "Validating API Gateway..."
if [[ -n "$API_GATEWAY_URL" ]]; then
    API_ID=$(echo "$API_GATEWAY_URL" | sed -n 's/.*\/\/\([^.]*\).*/\1/p')
    if [[ -n "$API_ID" ]]; then
        check_aws_resource "API Gateway" "$API_ID" "aws apigateway get-rest-api --rest-api-id $API_ID --region $REGION"
    fi
fi

# Validate Secrets Manager secrets
print_status "Validating AWS Secrets Manager secrets..."
SECRET_PREFIX="ek-bharath/$ENVIRONMENT"
SECRETS=(
    "$SECRET_PREFIX/jwt-secret"
    "$SECRET_PREFIX/encryption-key"
    "$SECRET_PREFIX/external-api-keys"
    "$SECRET_PREFIX/ai-service-keys"
    "$SECRET_PREFIX/database-credentials"
)

for secret in "${SECRETS[@]}"; do
    check_aws_resource "Secret" "$secret" "aws secretsmanager describe-secret --secret-id '$secret' --region $REGION" false
done

# Validate SSM Parameters
print_status "Validating SSM Parameters..."
PARAMETER_PREFIX="/ek-bharath/$ENVIRONMENT"
run_check "SSM Parameters Exist" "aws ssm get-parameters-by-path --path '$PARAMETER_PREFIX' --region $REGION --query 'Parameters[0]'" false

# Validate Lambda Functions
print_status "Validating Lambda functions..."
LAMBDA_FUNCTIONS=(
    "${STACK_NAME}-AuthFunction"
    "${STACK_NAME}-TranslationFunction"
    "${STACK_NAME}-ProductFunction"
    "${STACK_NAME}-BiddingFunction"
    "${STACK_NAME}-ChatFunction"
    "${STACK_NAME}-PriceDiscoveryFunction"
)

for func in "${LAMBDA_FUNCTIONS[@]}"; do
    # Try to find the function with a pattern since CDK generates unique names
    ACTUAL_FUNC_NAME=$(aws lambda list-functions --region $REGION --query "Functions[?contains(FunctionName, '$func')].FunctionName" --output text 2>/dev/null | head -1)
    if [[ -n "$ACTUAL_FUNC_NAME" ]]; then
        check_aws_resource "Lambda Function" "$ACTUAL_FUNC_NAME" "aws lambda get-function --function-name '$ACTUAL_FUNC_NAME' --region $REGION" false
    else
        print_warning "⚠ Lambda Function pattern not found: $func"
        WARNING_CHECKS=$((WARNING_CHECKS + 1))
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    fi
done

# Test API Gateway endpoints (if accessible)
if [[ -n "$API_GATEWAY_URL" ]]; then
    print_status "Testing API Gateway endpoints..."
    
    # Test health endpoint (if it exists)
    run_check "API Gateway Health Check" "curl -s -f '$API_GATEWAY_URL/v1/health' -o /dev/null" false
    
    # Test CORS preflight
    run_check "API Gateway CORS" "curl -s -X OPTIONS '$API_GATEWAY_URL/v1/auth/login' -H 'Origin: https://localhost:3000' -o /dev/null" false
fi

# Validate IAM roles and policies
print_status "Validating IAM resources..."
run_check "Lambda Execution Role" "aws iam get-role --role-name ${STACK_NAME}-LambdaExecutionRole --region $REGION" false

# Environment-specific validations
case $ENVIRONMENT in
    development)
        print_status "Running development-specific validations..."
        # Check if resources are configured for cost optimization
        run_check "DynamoDB On-Demand Billing" "aws dynamodb describe-table --table-name $USERS_TABLE --region $REGION --query 'Table.BillingModeSummary.BillingMode' --output text | grep -q 'PAY_PER_REQUEST'" false
        ;;
    staging)
        print_status "Running staging-specific validations..."
        # Check if monitoring is enabled
        run_check "CloudWatch Logs" "aws logs describe-log-groups --log-group-name-prefix '/aws/lambda/$STACK_NAME' --region $REGION --query 'logGroups[0]'" false
        ;;
    production)
        print_status "Running production-specific validations..."
        # Check if backup and monitoring are properly configured
        run_check "DynamoDB Point-in-Time Recovery" "aws dynamodb describe-continuous-backups --table-name $USERS_TABLE --region $REGION --query 'ContinuousBackupsDescription.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus' --output text | grep -q 'ENABLED'" false
        run_check "S3 Versioning Enabled" "aws s3api get-bucket-versioning --bucket $MEDIA_BUCKET --region $REGION --query 'Status' --output text | grep -q 'Enabled'" false
        ;;
esac

# Performance and security checks
print_status "Running security and performance checks..."

# Check S3 bucket policies
if [[ -n "$MEDIA_BUCKET" ]]; then
    run_check "S3 Bucket Policy Exists" "aws s3api get-bucket-policy --bucket $MEDIA_BUCKET --region $REGION" false
fi

# Check encryption settings
if [[ -n "$USERS_TABLE" ]]; then
    run_check "DynamoDB Encryption" "aws dynamodb describe-table --table-name $USERS_TABLE --region $REGION --query 'Table.SSEDescription.Status' --output text | grep -q 'ENABLED'" false
fi

# Generate validation report
print_status "Generating validation report..."

REPORT_FILE="validation-report-$ENVIRONMENT-$(date +%Y%m%d-%H%M%S).json"

cat > "$REPORT_FILE" << EOF
{
    "validation_summary": {
        "environment": "$ENVIRONMENT",
        "region": "$REGION",
        "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
        "total_checks": $TOTAL_CHECKS,
        "passed_checks": $PASSED_CHECKS,
        "failed_checks": $FAILED_CHECKS,
        "warning_checks": $WARNING_CHECKS,
        "success_rate": $(echo "scale=2; $PASSED_CHECKS * 100 / $TOTAL_CHECKS" | bc -l 2>/dev/null || echo "0")
    },
    "infrastructure": {
        "stack_name": "$STACK_NAME",
        "api_gateway_url": "$API_GATEWAY_URL",
        "user_pool_id": "$USER_POOL_ID",
        "tables": {
            "users": "$USERS_TABLE",
            "products": "$PRODUCTS_TABLE"
        },
        "buckets": {
            "media": "$MEDIA_BUCKET",
            "voice": "$VOICE_BUCKET"
        }
    }
}
EOF

print_success "Validation report saved: $REPORT_FILE"

# Summary
echo ""
print_status "Validation Summary:"
echo "  Total Checks: $TOTAL_CHECKS"
echo "  Passed: $PASSED_CHECKS"
echo "  Failed: $FAILED_CHECKS"
echo "  Warnings: $WARNING_CHECKS"

if [[ $FAILED_CHECKS -eq 0 ]]; then
    print_success "All critical validations passed!"
    if [[ $WARNING_CHECKS -gt 0 ]]; then
        print_warning "$WARNING_CHECKS non-critical issues found. Review the warnings above."
    fi
    exit 0
else
    print_error "$FAILED_CHECKS critical validations failed!"
    print_error "Please fix the issues above before proceeding."
    exit 1
fi