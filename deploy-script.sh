#!/bin/bash

# RecommendAI.org GCP Deployment Script
# Run this script after installing gcloud CLI and authenticating

set -e  # Exit on any error

echo "🚀 Starting RecommendAI.org deployment to Google Cloud Platform..."

# Configuration
PROJECT_ID="recommendai-prod"
REGION="us-central1"
SERVICE_NAME="recommendai"
DB_INSTANCE="recommendai-db"
DB_NAME="recommendai"
DB_USER="recommendai-user"

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

# Check if gcloud is installed
GCLOUD_CMD=""
if command -v gcloud &> /dev/null; then
    GCLOUD_CMD="gcloud"
elif [ -f ~/google-cloud-sdk/bin/gcloud ]; then
    GCLOUD_CMD="~/google-cloud-sdk/bin/gcloud"
    export PATH="$PATH:~/google-cloud-sdk/bin"
elif [ -f /usr/local/bin/gcloud ]; then
    GCLOUD_CMD="/usr/local/bin/gcloud"
elif [ -f /opt/google-cloud-sdk/bin/gcloud ]; then
    GCLOUD_CMD="/opt/google-cloud-sdk/bin/gcloud"
    export PATH="$PATH:/opt/google-cloud-sdk/bin"
else
    echo_error "gcloud CLI not found. Please provide the full path to gcloud:"
    read -p "Enter gcloud path (e.g., ~/google-cloud-sdk/bin/gcloud): " GCLOUD_PATH
    if [ -f "$GCLOUD_PATH" ]; then
        GCLOUD_CMD="$GCLOUD_PATH"
        export PATH="$PATH:$(dirname $GCLOUD_PATH)"
    else
        echo_error "Invalid gcloud path. Please install gcloud CLI first:"
        echo "Visit: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
fi

echo_success "Using gcloud at: $GCLOUD_CMD"

# Check if user is authenticated
if ! $GCLOUD_CMD auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo_error "Not authenticated with gcloud. Please run:"
    echo "$GCLOUD_CMD auth login"
    exit 1
fi

echo_info "Creating GCP project: $PROJECT_ID"
gcloud projects create $PROJECT_ID --name="RecommendAI Production" || echo_info "Project might already exist"

echo_info "Setting project as default"
gcloud config set project $PROJECT_ID

echo_info "Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable secretmanager.googleapis.com
echo_success "APIs enabled"

echo_info "Creating Cloud SQL PostgreSQL instance..."
gcloud sql instances create $DB_INSTANCE \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=$REGION \
    --storage-size=10GB \
    --storage-type=SSD \
    --backup || echo_info "Database instance might already exist"

echo_info "Creating database..."
gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE || echo_info "Database might already exist"

# Prompt for database password
echo_info "Please enter a secure password for the database user:"
read -s DB_PASSWORD

echo_info "Creating database user..."
gcloud sql users create $DB_USER \
    --instance=$DB_INSTANCE \
    --password=$DB_PASSWORD || echo_info "User might already exist"

# Get connection name
CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE --format="value(connectionName)")
echo_success "Database connection name: $CONNECTION_NAME"

# Create DATABASE_URL
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@/$DB_NAME?host=/cloudsql/$CONNECTION_NAME&sslmode=require"

echo_info "Creating secrets in Secret Manager..."
echo -n "$DATABASE_URL" | gcloud secrets create DATABASE_URL --data-file=- || echo_info "DATABASE_URL secret might already exist"

# Prompt for JWT secret
echo_info "Please enter a secure JWT secret (or press Enter to generate one):"
read JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -hex 32)
    echo_info "Generated JWT secret: $JWT_SECRET"
fi

echo -n "$JWT_SECRET" | gcloud secrets create JWT_SECRET --data-file=- || echo_info "JWT_SECRET might already exist"

echo_success "Secrets created"

echo_info "Building and deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
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
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo_success "🎉 Deployment completed!"
echo_success "Your application is available at: $SERVICE_URL"

echo_info "Next steps:"
echo "1. Test your application at the URL above"
echo "2. Setup custom domain (recommendai.org):"
echo "   gcloud run domain-mappings create --service $SERVICE_NAME --domain recommendai.org --region $REGION"
echo "3. Update your DNS records to point to Google Cloud"
echo "4. Run database migrations if needed"

echo_info "To connect to your database for migrations:"
echo "gcloud sql connect $DB_INSTANCE --user=$DB_USER"