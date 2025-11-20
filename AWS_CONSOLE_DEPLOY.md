# Quick AWS Deployment via Console (15 minutes)

## Step 1: Create EKS Cluster via AWS Console

1. Go to: https://console.aws.amazon.com/eks
2. Click "Add cluster" → "Create"
3. Settings:
   - Name: `airbnb-lab2`
   - Kubernetes version: 1.28
   - Cluster service role: Create new role
   - Click "Next"
4. Networking: Use defaults, Click "Next"
5. Click "Create"
6. **Wait 10-15 minutes** for cluster to be ready

## Step 2: Add Node Group

1. After cluster is "Active", go to "Compute" tab
2. Click "Add node group"
3. Settings:
   - Name: `airbnb-nodes`
   - Node IAM role: Create new
   - Instance type: t3.medium
   - Desired size: 2
4. Click "Create"

## Step 3: Connect kubectl
```bash
aws eks update-kubeconfig --name airbnb-lab2 --region us-west-2
kubectl get nodes
```

## Step 4: Deploy Application
```bash
kubectl apply -f kubernetes/deployment.yaml
kubectl get all -n airbnb
```

## Step 5: Take Screenshots

1. EKS Cluster page showing "Active"
2. Node group showing 2 nodes
3. Terminal: kubectl get pods -n airbnb
4. Terminal: kubectl get svc -n airbnb

## Login Credentials
- Email: manjot.kaur02@sjsu.edu
- Username: Manjott@5
