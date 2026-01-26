#!/bin/bash

# Build script for Lambda functions
# This script compiles TypeScript and prepares Lambda deployment packages

set -e

echo "🚀 Building Lambda functions for Ek Bharath Ek Mandi..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to build a single Lambda
build_lambda() {
    local lambda_name=$1
    local lambda_path="src/lambda/$lambda_name"
    
    echo -e "${YELLOW}Building $lambda_name Lambda...${NC}"
    
    if [ ! -d "$lambda_path" ]; then
        echo -e "${RED}Error: Lambda directory $lambda_path not found${NC}"
        return 1
    fi
    
    cd "$lambda_path"
    
    # Install dependencies if package.json exists
    if [ -f "package.json" ]; then
        echo "Installing dependencies for $lambda_name..."
        npm install --production
    fi
    
    # Compile TypeScript if tsconfig.json exists
    if [ -f "../tsconfig.json" ]; then
        echo "Compiling TypeScript for $lambda_name..."
        npx tsc --project ../tsconfig.json --outDir ./dist
        
        # Copy package.json and node_modules to dist
        if [ -f "package.json" ]; then
            cp package.json dist/
        fi
        
        if [ -d "node_modules" ]; then
            cp -r node_modules dist/
        fi
    fi
    
    cd - > /dev/null
    echo -e "${GREEN}✅ $lambda_name built successfully${NC}"
}

# Build all Lambda functions
LAMBDA_FUNCTIONS=("auth" "translation" "products" "bidding" "chat" "price-discovery")

for lambda in "${LAMBDA_FUNCTIONS[@]}"; do
    build_lambda "$lambda"
done

echo -e "${GREEN}🎉 All Lambda functions built successfully!${NC}"

# Verify CDK can find the assets
echo -e "${YELLOW}Verifying CDK asset paths...${NC}"

for lambda in "${LAMBDA_FUNCTIONS[@]}"; do
    lambda_path="src/lambda/$lambda"
    if [ -f "$lambda_path/index.ts" ] || [ -f "$lambda_path/dist/index.js" ]; then
        echo -e "${GREEN}✅ $lambda assets ready${NC}"
    else
        echo -e "${RED}❌ $lambda assets missing${NC}"
    fi
done

echo -e "${GREEN}🚀 Ready for CDK deployment!${NC}"
echo ""
echo "Next steps:"
echo "1. cd infrastructure"
echo "2. npm run deploy"
echo ""