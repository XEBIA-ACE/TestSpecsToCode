#!/bin/bash

# Define variables for deployment
STAGING_SERVER="staging.example.com"
DEPLOY_DIR="/var/www/currency_rate_display"

# Check if service is running and stop it!
ssh user@$STAGING_SERVER "if pgrep -x 'currency_service' > /dev/null; then sudo systemctl stop currency_service; fi"

# Create deployment directory if it doesn't exist
ssh user@$STAGING_SERVER "mkdir -p $DEPLOY_DIR"

# Copy the application files to the staging environment
scp -r ./build/* user@$STAGING_SERVER:$DEPLOY_DIR

# Start the service
ssh user@$STAGING_SERVER "sudo systemctl start currency_service"

# Verify deployment
ssh user@$STAGING_SERVER "curl -Is http://localhost:8080 | head -n 1"