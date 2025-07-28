# User Management System - Template

This is a template for user management documentation. Copy this file to `USER_MANAGEMENT.md` and fill in your specific details.

## 🔐 Security First

⚠️ **IMPORTANT**:

- Copy this template to `USER_MANAGEMENT.md` for your local use
- Do NOT commit the actual `USER_MANAGEMENT.md` file to version control
- Keep your admin credentials secure and private

## 📋 How to Add Users

### Method 1: Using the Command Line Script (Recommended)

```bash
# List all current users
docker-compose exec backend deno run --allow-read --allow-write --unstable-fs add_user.ts list

# Add a new user
docker-compose exec backend deno run --allow-read --allow-write --unstable-fs add_user.ts add <username> <password>

# Delete a user
docker-compose exec backend deno run --allow-read --allow-write --unstable-fs add_user.ts delete <username>
```

### Method 2: Using the API Directly

```bash
# First, get an admin token (replace with your actual admin credentials)
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"<your-admin-username>","password":"<your-admin-password>"}' | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# List all users
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/users

# Create a new user
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"username":"newuser","password":"<secure-password>"}'
```

## 🔒 Security Best Practices

1. **Change Default Passwords**: Immediately change any default passwords after setup
2. **Strong Passwords**: Use strong, unique passwords for each user (12+ characters, mix of letters, numbers, symbols)
3. **Environment Variables**: Use environment variables for sensitive configuration
4. **Regular Updates**: Regularly update user passwords and review access

## 🚀 Login to Dashboard

1. Go to `http://localhost:3000/admin/login`
2. Use your admin credentials
3. You'll be redirected to the admin dashboard at `http://localhost:3000/admin/dashboard`

## 📊 Available API Endpoints

- `GET /api/users` - List all users (requires admin token)
- `POST /api/users` - Create new user (requires admin token)
- `PUT /api/users/:id` - Update user password (requires admin token)
- `DELETE /api/users/:id` - Delete user (requires admin token)

## ⚠️ Security Warnings

- **NEVER** commit passwords or tokens to version control
- **NEVER** share admin credentials
- **ALWAYS** use HTTPS in production
- **REGULARLY** audit user access and permissions
- **IMMEDIATELY** change default passwords after setup
