#!/usr/bin/env bash
set -euo pipefail

cat <<'EOF'
This repository deploys through GitHub Actions.

Use these workflows from GitHub:
1. Bootstrap Production
   Run once to provision /var/www/creditremovers, the MySQL database/user,
   the PM2 process, the Nginx site, and the Let's Encrypt certificate.
2. Deploy Production
   Runs on pushes to main and can also be triggered manually.

Required repository secrets:
- SSH_HOST
- SSH_USER
- SSH_PRIVATE_KEY
- LETSENCRYPT_EMAIL
- MYSQL_PASSWORD
- PROD_ENV_FILE
EOF
