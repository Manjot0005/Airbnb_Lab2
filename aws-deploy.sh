#!/bin/bash
# AWS EKS Deployment Script

echo "🚀 Starting AWS Deployment..."

# Step 1: Install eksctl (if not installed)
# brew install eksctl  # macOS
# Or download from https://eksctl.io

# Step 2: Create EKS Cluster
echo "Creating EKS cluster..."
eksctl create cluster \
  --name airbnb-lab2 \
  --region us-west-2 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 3 \
  --managed

# Step 3: Verify cluster
kubectl get nodes

# Step 4: Deploy application
kubectl apply -f kubernetes/deployment.yaml

# Step 5: Get services
kubectl get all -n airbnb

echo "✅ Deployment complete!"
echo "Get LoadBalancer URL:"
kubectl get svc -n airbnb
