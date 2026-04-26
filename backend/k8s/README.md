# Kubernetes manifests

Add Deployment + Service YAMLs per microservice here. Suggested layout:

```
k8s/
  api-gateway/
    deployment.yaml
    service.yaml
  user-service/
    deployment.yaml
    service.yaml
  ...
  ingress.yaml
  configmaps/
  secrets/
```
