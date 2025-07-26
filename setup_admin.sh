#!/bin/bash
echo "Setting up admin credentials..."
docker-compose exec backend deno run --allow-read --allow-write --allow-env --unstable-fs set_admin_password.ts admin password123
echo ""
echo "✅ Admin credentials set up successfully!"
echo "Username: admin"
echo "Password: password123"
echo ""
echo "You can now login at: http://localhost:3000/admin/login" 