#!/bin/bash

# This script restores the API files after the Vercel deployment is complete

# Check if backup directory exists
if [ ! -d ".api_backup" ]; then
  echo "Backup directory not found. Nothing to restore."
  exit 0
fi

# Print current files for verification
echo "Current API files:"
ls -la api/

# Move files back from backup
echo "Restoring API files from backup..."
for file in .api_backup/*; do
  filename=$(basename "$file")
  echo "Restoring $filename"
  mv "$file" "api/$filename"
done

# Remove the backup directory
rmdir .api_backup

# Print restored files for verification
echo "Restored API files:"
ls -la api/

echo "API files successfully restored"