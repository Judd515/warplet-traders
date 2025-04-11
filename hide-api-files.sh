#!/bin/bash

# This script temporarily renames API files (except all-routes.js) to hide them from Vercel
# during the build process to avoid hitting the 12 function limit on the Hobby plan

# Create a backup directory
mkdir -p .api_backup

# Print current files for verification
echo "Current API files:"
ls -la api/

# Move/backup all files in /api except for all-routes.js
echo "Moving API files to backup (except all-routes.js)..."
for file in api/*; do
  filename=$(basename "$file")
  if [ "$filename" != "all-routes.js" ]; then
    echo "Moving $filename to backup"
    mv "$file" ".api_backup/$filename"
  else
    echo "Keeping $filename"
  fi
done

# Print remaining files for verification
echo "Remaining API files:"
ls -la api/

echo "API files successfully hidden for Vercel deployment"