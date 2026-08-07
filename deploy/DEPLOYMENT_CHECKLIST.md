# Production Deployment Checklist
# User Management – US-001: Profile View & Edit
# Run this checklist before and after every production deployment.

## Pre-Deployment

- [ ] All unit and integration tests pass locally (`npm test`)
- [ ] Test coverage is ≥ 80% (constitution.md requirement)
- [ ] Docker image built and pushed to registry with the correct tag
- [ ] `deploy/kubernetes/deployment.yaml` reviewed for correct image tag
- [ ] Kubernetes Secrets (`user-management-secrets`) are up to date in production namespace
- [ ] ConfigMap (`user-management-config`) is up to date in production namespace
- [ ] Database migrations (if any) have been applied and verified
- [ ] Email service connectivity confirmed from production cluster
- [ ] Rollback plan documented: previous image tag noted (`kubectl get deployment user-management -n production -o jsonpath='{.spec.template.spec.containers[0].image}'`)
- [ ] Maintenance window communicated to stakeholders (if required)

## Deployment Execution

- [ ] Run `./deploy/deploy-production.sh <IMAGE_TAG>` (or trigger GitHub Actions workflow)
- [ ] Monitor rollout: `kubectl rollout status deployment/user-management -n production`
- [ ] Confirm all pods reach `Running` state: `kubectl get pods -n production -l app=user-management`
- [ ] Confirm `readyReplicas` equals `replicas` in deployment status

## Post-Deployment Verification

### Zero Downtime
- [ ] No HTTP 5xx errors observed in ingress/load-balancer logs during rollout
- [ ] No pod restarts during rollout (`kubectl get pods -n production` — RESTARTS column = 0)

### Profile Feature Functional (US-001)
- [ ] `GET /api/v1/profile` returns user profile (Name, Email, Registration Date, Account Status)
- [ ] `PUT /api/v1/profile` successfully updates the Name field
- [ ] Name field validation rejects names that are too short/long or contain invalid characters
- [ ] XSS payload in Name field is sanitised and rejected
- [ ] Audit log entry created on Name change (timestamp, IP, user-agent present)
- [ ] Confirmation email received after successful Name update
- [ ] Email, Registration Date, and Account Status fields are read-only (PUT returns 400 if attempted)

### Performance
- [ ] Profile page load time < 2 seconds (measure with browser DevTools or synthetic monitor)

### Accessibility
- [ ] WCAG 2.1 AA compliance verified (run axe or Lighthouse audit on profile page)

### Security
- [ ] HTTPS enforced; HTTP redirects to HTTPS
- [ ] No sensitive data (passwords, secrets) visible in response payloads or logs

## Rollback Procedure (if issues found)

```bash
# Immediate rollback to previous revision
kubectl rollout undo deployment/user-management -n production

# Verify rollback completed
kubectl rollout status deployment/user-management -n production

# Confirm previous image is restored
kubectl get deployment user-management -n production \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
```

## Sign-off

| Role              | Name | Date | Signature |
|-------------------|------|------|-----------|
| Release Engineer  |      |      |           |
| QA Lead           |      |      |           |
| Product Owner     |      |      |           |
