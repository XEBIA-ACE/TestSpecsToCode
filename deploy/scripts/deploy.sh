```bash
#!/bin/bash

set -e

echo "Starting deployment script..."

# Ensure the working directory is the project root
cd "$(dirname "$0")/../.."

# Build the project
npm run build

# Deploy the build to the production server
echo "Deploying to production server..."
scp -r dist/* user@production-server:/path/to/application/

# Restart the server
echo "Restarting the server..."
ssh user@production-server 'supervisorctl restart app'

echo "Deployment completed successfully."
```