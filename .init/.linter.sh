#!/bin/bash
cd /home/kavia/workspace/code-generation/centralized-data-service-platform-235189-235210/centralized_db_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

