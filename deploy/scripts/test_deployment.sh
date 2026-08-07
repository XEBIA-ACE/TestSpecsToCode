```bash
#!/bin/bash

set -e

echo "Testing deployment script..."

# Test connection to the production server
echo "Testing SSH connection..."
ssh -q -o BatchMode=yes -o ConnectTimeout=5 user@production-server 'exit 0' || echo "SSH connection failed"

# Test if deployment directory exists
echo "Checking deployment directory..."
ssh user@production-server '[ -d /path/to/application ]' && echo "Deployment directory exists." || echo "Deployment directory does not exist."

# Test server restart
echo "Testing server restart..."
ssh user@production-server 'supervisorctl status app' && echo "Server running." || echo "Server not running."

echo "Deployment test completed."
```