#!/usr/bin/env bash
# deploy-production.sh
# Zero-downtime deployment script for User Management (US-001 – Profile View/Edit)
#
# Usage:
#   ./deploy/deploy-production.sh [IMAGE_TAG]
#
# Requirements:
#   - kubectl configured with production cluster context
#   - IMAGE_TAG defaults to 'latest' if not supplied
#
# Exit codes:
#   0  – deployment succeeded and health checks passed
#   1  – deployment failed; automatic rollback attempted

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
NAMESPACE="production"
DEPLOYMENT="user-management"
IMAGE_REPO="xebia-ace/user-management"
IMAGE_TAG="${1:-latest}"
FULL_IMAGE="${IMAGE_REPO}:${IMAGE_TAG}"
ROLLOUT_TIMEOUT="300s"          # 5 minutes max for rollout
HEALTH_CHECK_RETRIES=10
HEALTH_CHECK_INTERVAL=6         # seconds between retries
PROFILE_ENDPOINT="/api/v1/profile/health"   # smoke-test for profile feature

# ── Helpers ──────────────────────────────────────────────────────────────────
log()  { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*"; }
fail() { log "ERROR: $*"; exit 1; }

require_tool() {
  command -v "$1" >/dev/null 2>&1 || fail "'$1' is required but not installed."
}

# ── Pre-flight checks ────────────────────────────────────────────────────────
require_tool kubectl
require_tool curl

log "Starting production deployment: ${FULL_IMAGE}"
log "Namespace: ${NAMESPACE} | Deployment: ${DEPLOYMENT}"

# Verify cluster connectivity
kubectl cluster-info --context="$(kubectl config current-context)" >/dev/null \
  || fail "Cannot reach Kubernetes cluster. Check kubeconfig."

# Verify the deployment exists
kubectl get deployment "${DEPLOYMENT}" -n "${NAMESPACE}" >/dev/null \
  || fail "Deployment '${DEPLOYMENT}' not found in namespace '${NAMESPACE}'."

# ── Capture current image for rollback ───────────────────────────────────────
PREVIOUS_IMAGE=$(kubectl get deployment "${DEPLOYMENT}" -n "${NAMESPACE}" \
  -o jsonpath='{.spec.template.spec.containers[0].image}')
log "Current image (rollback target): ${PREVIOUS_IMAGE}"

# ── Apply Kubernetes manifests ───────────────────────────────────────────────
log "Applying Kubernetes manifests..."
kubectl apply -f deploy/kubernetes/deployment.yaml

# ── Update image (triggers rolling update) ───────────────────────────────────
log "Updating container image to ${FULL_IMAGE}..."
kubectl set image deployment/"${DEPLOYMENT}" \
  "${DEPLOYMENT}=${FULL_IMAGE}" \
  -n "${NAMESPACE}"

# ── Wait for rollout (zero-downtime gate) ────────────────────────────────────
log "Waiting for rollout to complete (timeout: ${ROLLOUT_TIMEOUT})..."
if ! kubectl rollout status deployment/"${DEPLOYMENT}" \
     -n "${NAMESPACE}" --timeout="${ROLLOUT_TIMEOUT}"; then
  log "Rollout did not complete within timeout. Initiating rollback..."
  kubectl rollout undo deployment/"${DEPLOYMENT}" -n "${NAMESPACE}"
  kubectl rollout status deployment/"${DEPLOYMENT}" \
    -n "${NAMESPACE}" --timeout="${ROLLOUT_TIMEOUT}" \
    && log "Rollback succeeded. Previous image restored: ${PREVIOUS_IMAGE}" \
    || log "WARNING: Rollback also timed out — manual intervention required."
  fail "Deployment failed. Rolled back to ${PREVIOUS_IMAGE}."
fi

log "Rollout complete. All pods are running the new image."

# ── Smoke test: profile feature functional check ─────────────────────────────
# Retrieve the service ClusterIP (or use port-forward in CI)
SVC_IP=$(kubectl get svc user-management-svc -n "${NAMESPACE}" \
  -o jsonpath='{.spec.clusterIP}' 2>/dev/null || echo "")

if [[ -n "${SVC_IP}" ]]; then
  log "Running profile feature smoke test against http://${SVC_IP}${PROFILE_ENDPOINT} ..."
  SMOKE_PASSED=false
  for i in $(seq 1 "${HEALTH_CHECK_RETRIES}"); do
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      "http://${SVC_IP}${PROFILE_ENDPOINT}" || echo "000")
    if [[ "${HTTP_STATUS}" == "200" ]]; then
      SMOKE_PASSED=true
      log "Smoke test passed (HTTP ${HTTP_STATUS}) on attempt ${i}."
      break
    fi
    log "Attempt ${i}/${HEALTH_CHECK_RETRIES}: HTTP ${HTTP_STATUS} — retrying in ${HEALTH_CHECK_INTERVAL}s..."
    sleep "${HEALTH_CHECK_INTERVAL}"
  done

  if [[ "${SMOKE_PASSED}" != "true" ]]; then
    log "Smoke test failed after ${HEALTH_CHECK_RETRIES} attempts. Initiating rollback..."
    kubectl rollout undo deployment/"${DEPLOYMENT}" -n "${NAMESPACE}"
    fail "Profile feature smoke test failed. Rolled back to ${PREVIOUS_IMAGE}."
  fi
else
  log "WARNING: Could not resolve service ClusterIP — skipping smoke test (run manually)."
fi

# ── Verify pod count ──────────────────────────────────────────────────────────
READY_PODS=$(kubectl get deployment "${DEPLOYMENT}" -n "${NAMESPACE}" \
  -o jsonpath='{.status.readyReplicas}')
DESIRED_PODS=$(kubectl get deployment "${DEPLOYMENT}" -n "${NAMESPACE}" \
  -o jsonpath='{.spec.replicas}')
log "Ready pods: ${READY_PODS}/${DESIRED_PODS}"
[[ "${READY_PODS}" == "${DESIRED_PODS}" ]] \
  || fail "Not all pods are ready (${READY_PODS}/${DESIRED_PODS})."

# ── Success ───────────────────────────────────────────────────────────────────
log "=========================================================="
log " Deployment SUCCESSFUL"
log "  Image   : ${FULL_IMAGE}"
log "  Pods    : ${READY_PODS}/${DESIRED_PODS} ready"
log "  Feature : Profile viewing and editing (US-001) is live"
log "=========================================================="
