# AWS Deployment Guide

## Prerequisites
1. AWS Account
2. AWS CLI installed and configured
3. kubectl installed
4. eksctl installed

## Quick Deploy to AWS
```bash
# Run deployment script
./aws-deploy.sh
```

## Manual Steps

### 1. Create EKS Cluster
```bash
eksctl create cluster --name airbnb-lab2 --region us-west-2 --nodes 2
```

### 2. Configure kubectl
```bash
aws eks update-kubeconfig --name airbnb-lab2 --region us-west-2
```

### 3. Deploy Application
```bash
kubectl apply -f kubernetes/deployment.yaml
kubectl get pods -n airbnb
```

### 4. Get LoadBalancer URL
```bash
kubectl get svc -n airbnb
```

## Screenshots to Take
1. EKS cluster in AWS console
2. kubectl get pods -n airbnb
3. kubectl get svc -n airbnb
4. Application running on AWS URL
