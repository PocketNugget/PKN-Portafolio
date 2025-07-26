#!/bin/sh
echo "Setting up admin credentials..."
deno run --allow-read --allow-write --allow-env --unstable-fs set_admin_password.ts admin password123
echo "Admin credentials set up successfully!"
echo "Username: admin"
echo "Password: password123" 