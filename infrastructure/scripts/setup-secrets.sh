#!/bin/bash

# Ek Bharath Ek Mandi - Secrets Setup Script

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
FORCE_UPDATE=false

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

Setup secrets in AWS Secrets Manager for Ek Bharath Ek Mandi.

OPTIONS:
    -e, --environment ENVIRONMENT    Target environment (development, staging, production)
    -r, --region REGION             AWS region (default: us-east-1)
    -f, --force                     Force update existing secrets
    -h, --help                      Show this help message

EXAMPLES:
    $0 --environment development
    $0 --environment production --region us-west-2
    $0 --environment staging --force

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
        -f|--force)
            FORCE_UPDATE=true
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

print_status "Setting up secrets for environment: $ENVIRONMENT in region: $REGION"

# Function to generate secure random string
generate_secret() {
    local length=${1:-64}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Function to check if secret exists
secret_exists() {
    local secret_name="$1"
    aws secretsmanager describe-secret --secret-id "$secret_name" --region "$REGION" > /dev/null 2>&1
}

# Function to create or update secret
create_or_update_secret() {
    local secret_name="$1"
    local secret_value="$2"
    local description="$3"
    
    if secret_exists "$secret_name"; then
        if [[ "$FORCE_UPDATE" == true ]]; then
            print_status "Updating existing secret: $secret_name"
            aws secretsmanager update-secret \
                --secret-id "$secret_name" \
                --secret-string "$secret_value" \
                --region "$REGION" > /dev/null
            print_success "Updated secret: $secret_name"
        else
            print_warning "Secret already exists: $secret_name (use --force to update)"
        fi
    else
        print_status "Creating new secret: $secret_name"
        aws secretsmanager create-secret \
            --name "$secret_name" \
            --description "$description" \
            --secret-string "$secret_value" \
            --region "$REGION" > /dev/null
        print_success "Created secret: $secret_name"
    fi
}

# JWT Secret
print_status "Setting up JWT secret..."
jwt_secret_name="ek-bharath/$ENVIRONMENT/jwt-secret"
jwt_secret_value=$(cat << EOF
{
    "algorithm": "HS256",
    "secret": "$(generate_secret 64)"
}
EOF
)
create_or_update_secret "$jwt_secret_name" "$jwt_secret_value" "JWT signing secret for authentication tokens"

# Encryption Key
print_status "Setting up encryption key..."
encryption_key_name="ek-bharath/$ENVIRONMENT/encryption-key"
encryption_key_value=$(cat << EOF
{
    "algorithm": "AES-256-GCM",
    "key": "$(generate_secret 64)"
}
EOF
)
create_or_update_secret "$encryption_key_name" "$encryption_key_value" "Encryption key for sensitive user data"

# External API Keys
print_status "Setting up external API keys..."
external_api_keys_name="ek-bharath/$ENVIRONMENT/external-api-keys"

# Get environment-specific API keys
case $ENVIRONMENT in
    development)
        enam_key="dev-enam-api-key-$(generate_secret 16)"
        apmc_key="dev-apmc-api-key-$(generate_secret 16)"
        weather_key="dev-weather-api-key-$(generate_secret 16)"
        maps_key="dev-maps-api-key-$(generate_secret 16)"
        ;;
    staging)
        enam_key="staging-enam-api-key-$(generate_secret 16)"
        apmc_key="staging-apmc-api-key-$(generate_secret 16)"
        weather_key="staging-weather-api-key-$(generate_secret 16)"
        maps_key="staging-maps-api-key-$(generate_secret 16)"
        ;;
    production)
        # For production, these should be real API keys
        # For now, we'll use placeholders that need to be manually updated
        enam_key="REPLACE_WITH_REAL_ENAM_API_KEY"
        apmc_key="REPLACE_WITH_REAL_APMC_API_KEY"
        weather_key="REPLACE_WITH_REAL_WEATHER_API_KEY"
        maps_key="REPLACE_WITH_REAL_MAPS_API_KEY"
        ;;
esac

external_api_keys_value=$(cat << EOF
{
    "enam_api_key": "$enam_key",
    "apmc_api_key": "$apmc_key",
    "weather_api_key": "$weather_key",
    "maps_api_key": "$maps_key"
}
EOF
)
create_or_update_secret "$external_api_keys_name" "$external_api_keys_value" "API keys for external services (eNAM, APMC, etc.)"

# AI Service Keys
print_status "Setting up AI service configuration..."
ai_service_keys_name="ek-bharath/$ENVIRONMENT/ai-service-keys"

# Get environment-specific AI configuration
case $ENVIRONMENT in
    development)
        bedrock_model="anthropic.claude-3-haiku-20240307-v1:0"  # Cheaper model for dev
        confidence_threshold="0.85"
        max_retries="2"
        ;;
    staging)
        bedrock_model="anthropic.claude-3-sonnet-20240229-v1:0"
        confidence_threshold="0.9"
        max_retries="3"
        ;;
    production)
        bedrock_model="anthropic.claude-3-sonnet-20240229-v1:0"
        confidence_threshold="0.95"
        max_retries="3"
        ;;
esac

ai_service_keys_value=$(cat << EOF
{
    "bedrock_model_id": "$bedrock_model",
    "openai_api_key": "REPLACE_WITH_REAL_OPENAI_KEY_IF_NEEDED",
    "google_translate_key": "REPLACE_WITH_REAL_GOOGLE_KEY_IF_NEEDED",
    "azure_cognitive_key": "REPLACE_WITH_REAL_AZURE_KEY_IF_NEEDED",
    "translation_confidence_threshold": "$confidence_threshold",
    "max_translation_retries": "$max_retries"
}
EOF
)
create_or_update_secret "$ai_service_keys_name" "$ai_service_keys_value" "Configuration and keys for AI services"

# Database Credentials (for future RDS integration)
print_status "Setting up database credentials..."
database_credentials_name="ek-bharath/$ENVIRONMENT/database-credentials"
database_password=$(generate_secret 32)
database_credentials_value=$(cat << EOF
{
    "username": "ekbharath_admin",
    "password": "$database_password",
    "engine": "postgres",
    "host": "placeholder-host-will-be-updated-when-rds-created",
    "port": 5432,
    "dbname": "ekbharath_$ENVIRONMENT"
}
EOF
)
create_or_update_secret "$database_credentials_name" "$database_credentials_value" "Database credentials for RDS instances"

# Create a summary file
summary_file="secrets-summary-$ENVIRONMENT.json"
print_status "Creating secrets summary file: $summary_file"

cat > "$summary_file" << EOF
{
    "environment": "$ENVIRONMENT",
    "region": "$REGION",
    "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "secrets": {
        "jwt_secret": {
            "arn": "arn:aws:secretsmanager:$REGION:$(aws sts get-caller-identity --query Account --output text):secret:$jwt_secret_name",
            "name": "$jwt_secret_name",
            "description": "JWT signing secret for authentication tokens"
        },
        "encryption_key": {
            "arn": "arn:aws:secretsmanager:$REGION:$(aws sts get-caller-identity --query Account --output text):secret:$encryption_key_name",
            "name": "$encryption_key_name",
            "description": "Encryption key for sensitive user data"
        },
        "external_api_keys": {
            "arn": "arn:aws:secretsmanager:$REGION:$(aws sts get-caller-identity --query Account --output text):secret:$external_api_keys_name",
            "name": "$external_api_keys_name",
            "description": "API keys for external services"
        },
        "ai_service_keys": {
            "arn": "arn:aws:secretsmanager:$REGION:$(aws sts get-caller-identity --query Account --output text):secret:$ai_service_keys_name",
            "name": "$ai_service_keys_name",
            "description": "Configuration and keys for AI services"
        },
        "database_credentials": {
            "arn": "arn:aws:secretsmanager:$REGION:$(aws sts get-caller-identity --query Account --output text):secret:$database_credentials_name",
            "name": "$database_credentials_name",
            "description": "Database credentials for RDS instances"
        }
    }
}
EOF

print_success "Secrets setup completed successfully!"
print_success "Summary file created: $summary_file"

# Production warnings
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo ""
    print_warning "IMPORTANT: Production Environment Detected!"
    print_warning "Please update the following secrets with real values:"
    echo "  1. External API keys (eNAM, APMC, Weather, Maps)"
    echo "  2. AI service keys (OpenAI, Google, Azure if using)"
    echo "  3. Database credentials when RDS is created"
    echo ""
    print_status "Use these commands to update secrets:"
    echo "  aws secretsmanager update-secret --secret-id $external_api_keys_name --secret-string '{\"enam_api_key\":\"real-key\"}'"
    echo "  aws secretsmanager update-secret --secret-id $ai_service_keys_name --secret-string '{\"openai_api_key\":\"real-key\"}'"
fi

# Verification
print_status "Verifying secrets..."
for secret_name in "$jwt_secret_name" "$encryption_key_name" "$external_api_keys_name" "$ai_service_keys_name" "$database_credentials_name"; do
    if secret_exists "$secret_name"; then
        print_success "✓ $secret_name"
    else
        print_error "✗ $secret_name"
    fi
done

print_success "Secrets verification completed!"