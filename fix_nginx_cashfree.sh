#!/bin/bash

# ============================================================
# Fix Cashfree 405 POST redirect on Nginx
# Run this on your server via SSH:
#   chmod +x fix_nginx_cashfree.sh && sudo bash fix_nginx_cashfree.sh
# ============================================================

NGINX_CONF=""

# Auto-detect nginx config file
for f in /etc/nginx/sites-available/*.conf /etc/nginx/sites-enabled/*.conf /etc/nginx/conf.d/*.conf /etc/nginx/nginx.conf; do
  if [ -f "$f" ] && grep -q "bhakti\|root.*build\|react\|index.html" "$f" 2>/dev/null; then
    NGINX_CONF="$f"
    break
  fi
done

if [ -z "$NGINX_CONF" ]; then
  echo "Could not auto-detect nginx config. Please enter the path manually:"
  read -r NGINX_CONF
fi

echo "Using config file: $NGINX_CONF"

# Backup the original config
cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d%H%M%S)"
echo "Backup created."

# Check if POST redirect already exists
if grep -q "request_method = POST" "$NGINX_CONF"; then
  echo "POST redirect already present in config. No changes needed."
  exit 0
fi

# Replace the location / block to add POST → GET redirect and React Router fallback
# This uses sed to find "location /" and update it
python3 - <<'PYEOF' "$NGINX_CONF"
import sys, re

path = sys.argv[1]
with open(path, 'r') as f:
    content = f.read()

# New location block with POST redirect + React Router support
new_location = '''    location / {
        # Convert Cashfree POST redirect to GET to avoid 405
        if ($request_method = POST) {
            return 302 $request_uri;
        }
        # React Router - serve index.html for all routes
        try_files $uri $uri/ /index.html;
    }'''

# Replace existing location / block
pattern = r'location\s*/\s*\{[^}]*\}'
if re.search(pattern, content):
    content = re.sub(pattern, new_location, content)
    print("Replaced existing location / block.")
else:
    print("WARNING: Could not find 'location /' block. Please add the following manually:")
    print(new_location)

with open(path, 'w') as f:
    f.write(content)

PYEOF

# Test nginx config
echo "Testing nginx config..."
nginx -t

if [ $? -eq 0 ]; then
  echo "✅ Config is valid. Reloading nginx..."
  systemctl reload nginx
  echo "✅ Done! Cashfree 405 error should now be fixed."
else
  echo "❌ Nginx config has errors. Restoring backup..."
  cp "${NGINX_CONF}.backup."* "$NGINX_CONF"
  echo "Backup restored. Please check your nginx config manually."
fi
