#!/bin/bash
# Script to restore API files after build (for local development)

# Check if backup directory exists
if [ ! -d ".api_backup" ]; then
  echo "Backup directory not found. Nothing to restore."
  exit 0
fi

# Move all files from backup back to api/
for file in .api_backup/*; do
  base_file=$(basename "$file")
  echo "Restoring $base_file"
  mv "$file" "api/$base_file"
done

# Remove backup directory
rmdir .api_backup

echo "API files successfully restored"
ls -la api/