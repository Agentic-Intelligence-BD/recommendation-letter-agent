# GitHub Actions CI/CD Setup for RecommendAI

## Setup Instructions

Your GitHub Actions workflow is ready! Follow these steps to complete the CI/CD setup:

### 1. Generate Service Account Key

First, generate a new service account key:

```bash
~/Downloads/google-cloud-sdk/bin/gcloud iam service-accounts keys create ~/gcp-key.json --iam-account=github-actions@recommendai-prod.iam.gserviceaccount.com
```

### 2. Add Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secret:

**Secret Name:** `GCP_SA_KEY`
**Secret Value:** Copy the entire content from the `~/gcp-key.json` file that was just generated

**Important:** Delete the key file after copying: `rm ~/gcp-key.json`

### 3. Push Your Code

Commit all changes and push to your `main` branch:

```bash
git add .
git commit -m "Setup CI/CD deployment to GCP Cloud Run"
git push origin main
```

### 4. Monitor Deployment

After pushing:
1. Go to your GitHub repository → Actions tab
2. You should see the workflow running automatically
3. The deployment will take 5-10 minutes
4. Check the workflow logs for the final service URL

### 5. Manual Deployment (Optional)

You can also trigger deployment manually from the Actions tab using the "workflow_dispatch" option.

### 6. Next Steps After Successful Deployment

1. **Test the Application**: Visit the deployed URL
2. **Setup Custom Domain**: Configure `recommendai.org` to point to your service
3. **Run Database Migrations**: If needed for your schema

### Troubleshooting

If the deployment fails:
1. Check the GitHub Actions logs
2. Ensure all secrets are properly set
3. Verify your application builds locally with `npm run build`

Your CI/CD pipeline is now ready! Every push to main will automatically deploy to Google Cloud Run.