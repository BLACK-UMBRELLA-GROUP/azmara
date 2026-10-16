#!/bin/sh
# Local visual check. Reuses installed tooling; never installs packages.
set -eu
AZMARA_TOOL_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if [ -n "${AZMARA_NODE:-}" ]; then
  AZMARA_NODE_BIN=$AZMARA_NODE
elif command -v node >/dev/null 2>&1; then
  AZMARA_NODE_BIN=$(command -v node)
else
  AZMARA_NODE_BIN="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi
if [ ! -x "$AZMARA_NODE_BIN" ]; then
  echo "Node is unavailable. Set AZMARA_NODE to an existing Node executable; nothing was installed." >&2
  exit 1
fi
exec "$AZMARA_NODE_BIN" "$AZMARA_TOOL_DIR/capture-game.cjs" "$@"
