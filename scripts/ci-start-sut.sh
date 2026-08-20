#!/usr/bin/env bash
# Start EShop SUT backend for CI (clone + npm install + background server).
set -euo pipefail

SUT_REPO="${SUT_REPO:-https://github.com/ttbhanh/eshop-sut.git}"
SUT_REF="${SUT_REF:-main}"
SUT_DIR="${SUT_DIR:-/tmp/eshop-sut}"
BACKEND_DIR="${SUT_DIR}/backend"
PORT="${SUT_PORT:-3000}"
PID_FILE="${SUT_DIR}/backend.pid"
LOG_FILE="${SUT_DIR}/backend.log"

if [[ ! -d "${SUT_DIR}/.git" ]]; then
  echo "Cloning SUT from ${SUT_REPO} (${SUT_REF})..."
  git clone --depth 1 --branch "${SUT_REF}" "${SUT_REPO}" "${SUT_DIR}"
else
  echo "SUT already cloned at ${SUT_DIR}"
fi

echo "Installing backend dependencies..."
cd "${BACKEND_DIR}"
npm install --omit=dev

if [[ -f "${PID_FILE}" ]] && kill -0 "$(cat "${PID_FILE}")" 2>/dev/null; then
  echo "SUT already running (pid $(cat "${PID_FILE}"))"
else
  echo "Starting backend on port ${PORT}..."
  nohup node server.js >"${LOG_FILE}" 2>&1 &
  echo $! >"${PID_FILE}"
fi

echo "Waiting for http://127.0.0.1:${PORT}/api/products ..."
for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${PORT}/api/products" -H "X-Student-Id: ${STUDENT_ID:-23127273}" >/dev/null; then
    echo "SUT ready after ${i}s"
    exit 0
  fi
  sleep 1
done

echo "SUT failed to start. Log:"
tail -50 "${LOG_FILE}" || true
exit 1
