#!/bin/bash

# RecommendAI.org Simple GCP Deployment Script
# This script will prompt for gcloud path if needed

set -e  # Exit on any error

echo "🚀 Starting RecommendAI.org deployment to Google Cloud Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

echo_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Find gcloud command
find_gcloud() {
    if command -v gcloud &> /dev/null; then
        echo "gcloud"
        return 0
    fi
    
    # Common installation paths
    COMMON_PATHS=(
        "$HOME/google-cloud-sdk/bin/gcloud"
        "/usr/local/google-cloud-sdk/bin/gcloud"
        "/opt/google-cloud-sdk/bin/gcloud"
        "$HOME/Downloads/google-cloud-sdk/bin/gcloud"
        "/Applications/Google Cloud SDK/google-cloud-sdk/bin/gcloud"
    )
    
    for path in "${COMMON_PATHS[@]}"; do
        if [ -f "$path" ]; then
            echo "$path"
            return 0
        fi
    done
    
    echo_error "gcloud not found in common locations."
    echo_info "Please enter the full path to your gcloud installation:"
    echo_info "Example: /Users/yourusername/google-cloud-sdk/bin/gcloud"
    read -p "gcloud path: " GCLOUD_PATH
    
    if [ -f "$GCLOUD_PATH" ]; then
        echo "$GCLOUD_PATH"
        return 0
    else
        echo_error "Invalid path: $GCLOUD_PATH"
        exit 1
    fi
}

# Get gcloud command
GCLOUD=$(find_gcloud)
echo_success "Found gcloud at: $GCLOUD"

# Add gcloud directory to PATH if needed
GCLOUD_DIR=$(dirname "$GCLOUD")
export PATH="$PATH:$GCLOUD_DIR"

# Configuration
PROJECT_ID="recommendai-prod"
REGION="us-central1"
SERVICE_NAME="recommendai"
DB_INSTANCE="recommendai-db"
DB_NAME="recommendai"
DB_USER="recommendai-user"

# Check authentication
echo_info "Checking authentication..."
if ! $GCLOUD auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo_error "Not authenticated with Google Cloud."
    echo_info "Running authentication now..."
    $GCLOUD auth login
fi

echo_success "Authenticated successfully"

# Create or set project
echo_info "Creating/setting project: $PROJECT_ID"
$GCLOUD projects create $PROJECT_ID --name="RecommendAI Production" 2>/dev/null || echo_info "Project already exists"
$GCLOUD config set project $PROJECT_ID

# Check billing
echo_info "Please ensure billing is enabled for this project in the Google Cloud Console:"
echo "https://console.cloud.google.com/billing/projects"
read -p "Press Enter once billing is enabled..."

# Enable APIs
echo_info "Enabling required APIs (this may take a few minutes)..."
$GCLOUD services enable run.googleapis.com
$GCLOUD services enable cloudbuild.googleapis.com  
$GCLOUD services enable sqladmin.googleapis.com
$GCLOUD services enable secretmanager.googleapis.com
echo_success "APIs enabled"

# Create database
echo_info "Creating Cloud SQL PostgreSQL instance (this may take 5-10 minutes)..."
$GCLOUD sql instances create $DB_INSTANCE \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=$REGION \
    --storage-size=10GB \
    --storage-type=SSD \
    --backup 2>/dev/null || echo_info "Database instance already exists"

echo_info "Creating database..."
$GCLOUD sql databases create $DB_NAME --instance=$DB_INSTANCE 2>/dev/null || echo_info "Database already exists"

# Get database password
echo_info "Enter a secure password for database user '$DB_USER':"
read -s DB_PASSWORD
echo

echo_info "Creating database user..."
$GCLOUD sql users create $DB_USER \
    --instance=$DB_INSTANCE \
    --password=$DB_PASSWORD 2>/dev/null || echo_info "User already exists"

# Get connection info
CONNECTION_NAME=$($GCLOUD sql instances describe $DB_INSTANCE --format="value(connectionName)")
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@/$DB_NAME?host=/cloudsql/$CONNECTION_NAME&sslmode=require"

# Create secrets
echo_info "Creating secrets..."
echo -n "$DATABASE_URL" | $GCLOUD secrets create DATABASE_URL --data-file=- 2>/dev/null || echo_info "DATABASE_URL secret already exists"

echo_info "Enter JWT secret (or press Enter to generate):"
read -s JWT_SECRET
echo
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -hex 32)
    echo_info "Generated JWT secret"
fi

echo -n "$JWT_SECRET" | $GCLOUD secrets create JWT_SECRET --data-file=- 2>/dev/null || echo_info "JWT_SECRET already exists"

# Deploy application
echo_info "Building and deploying application (this may take 5-10 minutes)..."
$GCLOUD run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --platform managed \
    --port 3000 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --allow-unauthenticated \
    --add-cloudsql-instances $CONNECTION_NAME \
    --set-secrets DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest

# Get service URL
SERVICE_URL=$($GCLOUD run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo_success "🎉 Deployment completed successfully!"
echo_success "Application URL: $SERVICE_URL"

echo_info "Next steps:"
echo "1. Test your application: $SERVICE_URL"
echo "2. Setup custom domain: $GCLOUD run domain-mappings create --service $SERVICE_NAME --domain recommendai.org --region $REGION"
echo "3. Run database migrations if needed"

echo_info "Database connection details:"
echo "Instance: $CONNECTION_NAME"
echo "Database: $DB_NAME"
echo "User: $DB_USER"