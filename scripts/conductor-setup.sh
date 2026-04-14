#!/bin/bash
set -e

echo "Setting up Scope3 Agentic Client workspace..."

# Find the git root directory (the actual repository root, not the workspace)
# Conductor provides CONDUCTOR_ROOT_PATH for the original repo location in newer versions
# Fall back to detecting from PWD or git for backward compatibility
if [ -n "$CONDUCTOR_ROOT_PATH" ]; then
  GIT_ROOT="$CONDUCTOR_ROOT_PATH"
elif [[ "$PWD" == *"/.conductor/"* ]]; then
  GIT_ROOT=$(echo "$PWD" | sed 's|\(.*\)/\.conductor/.*|\1|')
else
  GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
  if [ -z "$GIT_ROOT" ]; then
    echo "ERROR: Not inside a git repository"
    exit 1
  fi
fi

echo "Using repository root: $GIT_ROOT"

# Copy .env file from root repository
echo "Copying .env from root repository..."
if [ -f "$GIT_ROOT/.env" ]; then
  cp "$GIT_ROOT/.env" .env
  echo ".env file copied successfully"
elif [ -f ".env.example" ]; then
  echo "WARNING: .env file not found at $GIT_ROOT/.env"
  echo "Copying .env.example as a starting point..."
  cp .env.example .env
  echo "Please update .env with your actual values"
else
  echo "WARNING: No .env file found. Create one based on .env.example"
fi

# Export environment variables for validation
if [ -f ".env" ]; then
  echo "Loading environment variables..."
  set -a
  source .env
  set +a
fi

# Validate critical environment variables
MISSING_VARS=()

if [ -z "$SCOPE3_API_KEY" ]; then
  MISSING_VARS+=("SCOPE3_API_KEY")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo ""
  echo "WARNING: Missing environment variables:"
  for var in "${MISSING_VARS[@]}"; do
    echo "  - $var"
  done
  echo ""
  echo "Please update .env with your actual values before running the client."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

echo ""
echo "Workspace setup complete!"
echo ""
echo "Next steps:"
echo "  - Ensure SCOPE3_API_KEY is set in .env"
echo "  - Run 'npm run build' to compile TypeScript"
echo "  - Run 'npm test' to run tests"
