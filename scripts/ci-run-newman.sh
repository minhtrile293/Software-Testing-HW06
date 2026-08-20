#!/usr/bin/env bash
# Run Newman for FR06/07/16 with data file suffix: full | ci-smoke-pass | ci-smoke-one-fail
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROFILE="${1:-full}"
ENV_FILE="${ROOT}/postman/environments/HW06_local.postman_environment.json"
RESULTS="${ROOT}/results/newman"
mkdir -p "${RESULTS}"

case "${PROFILE}" in
  full)
    FR06_DATA="fr06-product-detail-data.csv"
    FR07_DATA="fr07-shopping-cart-data.csv"
    FR16_DATA="fr16-product-import-data.csv"
    ALLOW_FAIL="${CI_ALLOW_FAILURE:-false}"
    ;;
  ci-smoke-pass)
    FR06_DATA="fr06-ci-smoke-pass.csv"
    FR07_DATA="fr07-ci-smoke-pass.csv"
    FR16_DATA="fr16-ci-smoke-pass.csv"
    ALLOW_FAIL="false"
    ;;
  ci-smoke-one-fail)
    FR06_DATA="fr06-ci-smoke-one-fail.csv"
    FR07_DATA="fr07-ci-smoke-pass.csv"
    FR16_DATA="fr16-ci-smoke-pass.csv"
    ALLOW_FAIL="false"
    ;;
  *)
    echo "Unknown profile: ${PROFILE}" >&2
    exit 1
    ;;
esac

run_one() {
  local name="$1" collection="$2" data="$3"
  echo "=== Newman ${name} (${data}) ==="
  set +e
  newman run "${ROOT}/postman/collections/${collection}" \
    -e "${ENV_FILE}" \
    -d "${ROOT}/postman/data/${data}" \
    -r cli,htmlextra \
    --reporter-htmlextra-export "${RESULTS}/${name}-report.html" \
    --reporter-htmlextra-title "HW06 ${name} (${PROFILE})"
  local code=$?
  set -e
  if [[ ${code} -ne 0 && "${ALLOW_FAIL}" != "true" ]]; then
    echo "Newman failed for ${name} (exit ${code})" >&2
    exit "${code}"
  fi
  return 0
}

run_one "fr06" "HW06_FR06_ProductDetail.postman_collection.json" "${FR06_DATA}"
run_one "fr07" "HW06_FR07_ShoppingCart.postman_collection.json" "${FR07_DATA}"
run_one "fr16" "HW06_FR16_ProductImportCSV.postman_collection.json" "${FR16_DATA}"

echo "All Newman runs completed (profile=${PROFILE})"
