#!/bin/bash
# Script to hide API files before build (reduces serverless function count)

# Create backup directory
mkdir -p .api_backup

# Move all api files to backup except all-routes.js
for file in api/*; do
  base_file=$(basename "$file")
  if [ "$base_file" != "all-routes.js" ] && [ "$base_file" != "tsconfig.json" ]; then
    echo "Moving $file to backup"
    mv "$file" ".api_backup/$base_file"
  else
    echo "Keeping $file"
  fi
done

echo "API files successfully hidden for Vercel deployment"
ls -la api/