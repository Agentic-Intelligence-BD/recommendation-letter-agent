# RecommendAI.org - GCP Deployment Guide

## 🚀 Complete Guide to Deploy on Google Cloud Platform

### Prerequisites
- Google Cloud account with billing enabled
- `gcloud` CLI installed and configured
- Docker installed (optional, for custom deployments)
- Domain name ready (recommendai.org)

---

## Option 1: Cloud Run (Recommended - Serverless)

### Step 1: Setup Google Cloud Project
```bash
# Install gcloud CLI (if not already installed)
# Visit: https://cloud.google.com/sdk/docs/install

# Login and create project
gcloud auth login
gcloud projects create recommendai-prod --name="RecommendAI Production"
gcloud config set project recommendai-prod

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### Step 2: Setup Database (Cloud SQL - PostgreSQL)
```bash
# Create PostgreSQL instance
gcloud sql instances create recommendai-db \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --storage-size=10GB \
    --storage-type=SSD

# Create database
gcloud sql databases create recommendai --instance=recommendai-db

# Create database user
gcloud sql users create recommendai-user \
    --instance=recommendai-db \
    --password=YOUR_SECURE_PASSWORD

# Get connection name for later
gcloud sql instances describe recommendai-db --format="value(connectionName)"
```

### Step 3: Setup Environment Secrets
```bash
# Create secrets in Secret Manager
echo -n "postgresql://recommendai-user:YOUR_SECURE_PASSWORD@/recommendai?host=/cloudsql/PROJECT_ID:us-central1:recommendai-db&sslmode=require" | \
gcloud secrets create DATABASE_URL --data-file=-

echo -n "your-super-secure-jwt-secret-here" | \
gcloud secrets create JWT_SECRET --data-file=-
```

### Step 4: Create Dockerfile
```dockerfile
# Create Dockerfile in project root
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Step 5: Create Cloud Build Configuration
```yaml
# Create cloudbuild.yaml in project root
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: [
      'build', 
      '-t', 'gcr.io/$PROJECT_ID/recommendai:$COMMIT_SHA', 
      '.'
    ]
  
  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/recommendai:$COMMIT_SHA']
  
  # Deploy container image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
    - 'run'
    - 'deploy'
    - 'recommendai'
    - '--image=gcr.io/$PROJECT_ID/recommendai:$COMMIT_SHA'
    - '--region=us-central1'
    - '--platform=managed'
    - '--port=3000'
    - '--memory=512Mi'
    - '--cpu=1'
    - '--min-instances=0'
    - '--max-instances=10'
    - '--allow-unauthenticated'
    - '--add-cloudsql-instances=$PROJECT_ID:us-central1:recommendai-db'
    - '--set-secrets=DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest'

images:
  - gcr.io/$PROJECT_ID/recommendai:$COMMIT_SHA
```

### Step 6: Deploy Application
```bash
# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml

# Alternative: Direct deployment
gcloud run deploy recommendai \
    --source . \
    --region us-central1 \
    --platform managed \
    --port 3000 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --allow-unauthenticated \
    --add-cloudsql-instances PROJECT_ID:us-central1:recommendai-db \
    --set-secrets DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest
```

---

## Option 2: App Engine (Fully Managed Platform)

### Step 1: Create app.yaml
```yaml
# Create app.yaml in project root
runtime: nodejs18

env_variables:
  NODE_ENV: production

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6

vpc_access_connector:
  name: "projects/PROJECT_ID/locations/us-central1/connectors/recommendai-connector"

beta_settings:
  cloud_sql_instances: PROJECT_ID:us-central1:recommendai-db
```

### Step 2: Update package.json
```json
{
  "scripts": {
    "start": "next start",
    "build": "prisma generate && next build",
    "gcp-build": "prisma generate && npm run build"
  }
}
```

### Step 3: Deploy to App Engine
```bash
# Deploy application
gcloud app deploy

# View application
gcloud app browse
```

---

## Option 3: Compute Engine (Custom VM)

### Step 1: Create VM Instance
```bash
# Create VM instance
gcloud compute instances create recommendai-vm \
    --zone=us-central1-a \
    --machine-type=e2-micro \
    --network-interface=network-tier=PREMIUM,subnet=default \
    --metadata=enable-oslogin=true \
    --maintenance-policy=MIGRATE \
    --provisioning-model=STANDARD \
    --tags=http-server,https-server \
    --create-disk=auto-delete=yes,boot=yes,device-name=recommendai-vm,image=projects/ubuntu-os-cloud/global/images/ubuntu-2004-focal-v20231213,mode=rw,size=20,type=projects/PROJECT_ID/zones/us-central1-a/diskTypes/pd-balanced \
    --no-shielded-secure-boot \
    --shielded-vtpm \
    --shielded-integrity-monitoring \
    --reservation-affinity=any

# SSH into instance
gcloud compute ssh recommendai-vm --zone=us-central1-a
```

### Step 2: Setup VM Environment
```bash
# On the VM - Install Node.js and dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# Install PM2 for process management
sudo npm install -g pm2

# Clone your repository
git clone https://github.com/your-username/recommendai.git
cd recommendai

# Install dependencies and build
npm install
npm run build

# Setup environment variables
echo "DATABASE_URL=your-database-url" > .env.production
echo "JWT_SECRET=your-jwt-secret" >> .env.production

# Start application with PM2
pm2 start npm --name "recommendai" -- start
pm2 startup
pm2 save
```

---

## Domain Setup (recommendai.org)

### Step 1: Configure DNS
```bash
# Get your service URL
gcloud run services describe recommendai --region=us-central1 --format="value(status.url)"

# Map custom domain (Cloud Run)
gcloud run domain-mappings create \
    --service recommendai \
    --domain recommendai.org \
    --region us-central1

# For App Engine
gcloud app domain-mappings create recommendai.org
```

### Step 2: SSL Certificate
```bash
# Cloud Run automatically provides SSL
# For custom domains, certificates are auto-provisioned

# Verify domain mapping
gcloud run domain-mappings list --region=us-central1
```

---

## Database Migration

### Step 1: Run Prisma Migrations
```bash
# Connect to Cloud SQL via proxy
gcloud sql connect recommendai-db --user=recommendai-user

# Or use connection string in your app
# The DATABASE_URL will automatically connect via Unix socket in Cloud Run
```

### Step 2: Seed Database
```bash
# In your deployed app, run:
npx prisma db push
npx prisma db seed  # if you have seed data
```

---

## Monitoring & Logging

### Setup Cloud Monitoring
```bash
# Enable monitoring
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com

# View logs
gcloud logs tail projects/PROJECT_ID/logs/run.googleapis.com%2Fstderr
```

---

## Cost Optimization

### 1. Cloud Run (Recommended for your app)
- **Free tier**: 2 million requests/month
- **Pay per use**: Only pay when serving requests
- **Estimated cost**: $10-50/month for moderate traffic

### 2. Database Optimization
- **Start with**: db-f1-micro ($7.67/month)
- **Storage**: 10GB ($1.70/month)
- **Scale up**: as needed

### 3. Monitoring Costs
```bash
# Set up budget alerts
gcloud billing budgets create \
    --billing-account=BILLING_ACCOUNT_ID \
    --display-name="RecommendAI Budget" \
    --budget-amount=100USD
```

---

## CI/CD Pipeline (GitHub Actions)

### Create .github/workflows/deploy.yml
```yaml
name: Deploy to GCP

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - id: 'auth'
      uses: 'google-github-actions/auth@v1'
      with:
        credentials_json: '${{ secrets.GCP_SA_KEY }}'
    
    - name: 'Set up Cloud SDK'
      uses: 'google-github-actions/setup-gcloud@v1'
    
    - name: 'Deploy to Cloud Run'
      run: |
        gcloud builds submit --config cloudbuild.yaml
```

---

## Security Checklist

- ✅ **Secrets in Secret Manager** (not in code)
- ✅ **HTTPS enabled** (automatic with Cloud Run)
- ✅ **Database connection security** (Cloud SQL Proxy)
- ✅ **IAM permissions** (least privilege)
- ✅ **VPC network security** (if using Compute Engine)
- ✅ **Regular backups** (automatic with Cloud SQL)

---

## Quick Start Commands

```bash
# 1. Setup project
gcloud projects create recommendai-prod
gcloud config set project recommendai-prod

# 2. Enable APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com sqladmin.googleapis.com

# 3. Create database
gcloud sql instances create recommendai-db --database-version=POSTGRES_14 --tier=db-f1-micro --region=us-central1

# 4. Deploy app
gcloud run deploy recommendai --source . --region us-central1 --allow-unauthenticated

# 5. Map domain
gcloud run domain-mappings create --service recommendai --domain recommendai.org --region us-central1
```

---

## Support & Troubleshooting

### Common Issues:
1. **Database connection**: Check Cloud SQL proxy setup
2. **Build failures**: Verify Dockerfile and dependencies
3. **Environment variables**: Ensure secrets are properly set
4. **Domain mapping**: DNS propagation can take 24-48 hours

### Useful Commands:
```bash
# View service details
gcloud run services describe recommendai --region=us-central1

# View logs
gcloud logs read "projects/PROJECT_ID/logs/run.googleapis.com"

# Test locally
npm run build && npm start
```

**Recommended Choice**: Use **Cloud Run** for the best balance of simplicity, cost, and scalability for your Next.js application.