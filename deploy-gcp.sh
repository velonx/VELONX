#!/bin/bash

# Velonx Cloud Run Deployment Script
# This script builds and deploys the Velonx platform to Google Cloud Run

# Set your variables here or pass them as environment variables
PROJECT_ID=${PROJECT_ID:-"velonx-495418"}
REGION=${REGION:-"asia-south2"}
SERVICE_NAME=${SERVICE_NAME:-"velonx-platform"}
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Starting deployment to Google Cloud Run..."

# 1. Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "❌ You are not authenticated with Google Cloud. Running 'gcloud auth login'..."
    gcloud auth login
fi

# 2. Set the project
echo "📦 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# 3. Enable required services
echo "🔌 Enabling required Google Cloud APIs..."
gcloud services enable run.googleapis.com \
                       containerregistry.googleapis.com \
                       cloudbuild.googleapis.com

# 4. Build and push image using Cloud Build
echo "🏗️ Building and pushing container image..."
gcloud builds submit --tag $IMAGE_NAME

# 5. Deploy to Cloud Run
echo "🚢 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --timeout 3600 \
    --session-affinity \
    --set-env-vars "NODE_ENV=production"

echo "✅ Deployment complete!"
echo "🔗 Your service is live at: $(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')"
echo "⚠️  Remember to set your environment variables (DATABASE_URL, NEXTAUTH_SECRET, etc.) in the Cloud Run console."
