#!/usr/bin/env bash
# Bowls Club dev server manager

BOWLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$BOWLS_DIR/.bowls-dev.log"
PID_FILE="$BOWLS_DIR/.bowls-dev.pid"

bowls_start() {
  if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Already running (PID $(cat "$PID_FILE")) at http://localhost:3000"
    return
  fi

  echo "Starting Bowls Club dev server..."
  source ~/.nvm/nvm.sh && nvm use v22 --silent
  npm --prefix "$BOWLS_DIR" run dev > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"

  # Wait for server to be ready
  for i in $(seq 1 20); do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "30[0-9]"; then
      echo "Ready at http://localhost:3000  (log: $LOG_FILE)"
      return
    fi
    sleep 1
  done
  echo "Server started (PID $(cat "$PID_FILE")) — may still be compiling"
  echo "Log: $LOG_FILE"
}

bowls_stop() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid=$(cat "$PID_FILE")
    if kill -0 "$pid" 2>/dev/null; then
      # Kill the npm process and its children (the actual Next.js server)
      pkill -9 -P "$pid" 2>/dev/null
      kill -9 "$pid" 2>/dev/null
      # Also sweep port 3000 in case child outlived parent
      lsof -ti :3000 2>/dev/null | xargs kill -9 2>/dev/null
      sleep 1
      echo "Stopped (PID $pid)"
    else
      echo "Process $pid not running"
    fi
    rm -f "$PID_FILE"
  else
    # Fallback: kill anything on port 3000
    local pids
    pids=$(lsof -ti :3000 2>/dev/null)
    if [[ -n "$pids" ]]; then
      echo "$pids" | xargs kill -9 2>/dev/null
      echo "Stopped: $pids"
    else
      echo "Nothing running on port 3000"
    fi
  fi
}

bowls_logs() {
  if [[ -f "$LOG_FILE" ]]; then
    tail -f "$LOG_FILE"
  else
    echo "No log file found at $LOG_FILE"
  fi
}

bowls_status() {
  if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Running (PID $(cat "$PID_FILE")) at http://localhost:3000"
  else
    echo "Not running"
  fi
}

case "${1:-}" in
  start)  bowls_start ;;
  stop)   bowls_stop ;;
  restart) bowls_stop; sleep 1; bowls_start ;;
  logs)   bowls_logs ;;
  status) bowls_status ;;
  *)
    echo "Usage: bowls {start|stop|restart|logs|status}"
    ;;
esac
