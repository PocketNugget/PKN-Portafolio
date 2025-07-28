# User Management System

This document explains how to manage users for your website administration.

## 🔐 Current Users

You currently have these users in your database:

- **admin** (ID: 2) - Default admin user with password: `admin123`
- **dark-nugg** (ID: 1) - Existing user
- **editor** (ID: 3) - Newly created user with password: `mypassword123`

## 📋 How to Add Users

### Method 1: Using the Command Line Script (Recommended)

```bash
# List all current users
docker-compose exec backend deno run --allow-read --allow-write --unstable-fs add_user.ts list

# Add a new user
docker-compose exec backend deno run --allow-read --allow-write --unstable-fs add_user.ts add <username> <password>

# Delete a user
docker-compose exec backend deno run --allow-read --allow-write --unstable-fs add_user.ts delete <username>

# Examples:
docker-compose exec backend deno run --allow-read --allow-write --unstable-fs add_user.ts add manager securepass123
docker-compose exec backend deno run --allow-read --allow-write --unstable-fs add_user.ts delete manager
```

### Method 2: Using the API Directly

```bash
# First, get an admin token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# List all users
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/users

# Create a new user
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"username":"newuser","password":"newpassword123"}'

# Update user password
curl -X PUT http://localhost:8000/api/users/3 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"password":"newpassword456"}'

# Delete a user
curl -X DELETE http://localhost:8000/api/users/3 \
  -H "Authorization: Bearer $TOKEN"
```

## 🔒 Security Notes

1. **Change Default Passwords**: The default admin password is `admin123`. Change it immediately after setup.
2. **Strong Passwords**: Use strong, unique passwords for each user.
3. **Admin Protection**: The admin user (ID: 1) cannot be deleted for security reasons.
4. **Token Security**: JWT tokens are used for authentication. Keep them secure.

## 🚀 Login to Dashboard

1. Go to `http://localhost:3000/admin/login`
2. Use any of the created user credentials
3. You'll be redirected to the admin dashboard at `http://localhost:3000/admin/dashboard`

## 📊 Available API Endpoints

- `GET /api/users` - List all users (requires admin token)
- `POST /api/users` - Create new user (requires admin token)
- `PUT /api/users/:id` - Update user password (requires admin token)
- `DELETE /api/users/:id` - Delete user (requires admin token)

## 🛠️ Troubleshooting

### If the script doesn't work:

1. Make sure the backend container is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Try the API method instead

### If you can't login:

1. Verify the user exists: `docker-compose exec backend deno run --allow-read --allow-write --unstable-fs add_user.ts list`
2. Check if the password is correct
3. Try creating a new user with a simple password

### Database issues:

1. The database is stored in `/data/data.db` inside the backend container
2. If you need to reset, you can delete the database file and restart the container
3. The admin user will be automatically recreated on startup
