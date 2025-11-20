# Kubernetes Deployment SUCCESS ✅

## Minikube Cluster Running
- Cluster: minikube
- Namespace: airbnb
- Pods: 2/2 Running
- Service: airbnb-service (NodePort)
- URL: http://127.0.0.1:50481

## Commands Used
```bash
minikube start --cpus=2 --memory=3000
kubectl apply -f /tmp/simple-deployment.yaml
kubectl get all -n airbnb
```

## Screenshot Evidence
- Pods running: airbnb-app-5747895bfd-7nr4r (1/1 Running)
- Pods running: airbnb-app-5747895bfd-f92xl (1/1 Running)
- Service exposed: http://127.0.0.1:50481
