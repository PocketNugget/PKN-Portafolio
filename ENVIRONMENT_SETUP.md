# Environment Variables Setup Guide

## 🔐 **Where Environment Variables Are Stored**

### **Current Setup:**

1. **Docker Compose**: Uses `env_file: - ../.env` to load from `.env` file
2. **Backend**: Uses Deno's dotenv loader to read `.env` file
3. **Fallbacks**: Hardcoded defaults in code (for development only)

### **Environment Variable Locations:**

#### **1. .env File (Recommended)**

```
PKN-Portafolio/
├── .env                    ← Your actual environment variables (gitignored)
├── env.example            ← Template file (safe to commit)
└── docker/
    └── docker-compose.yml ← References ../.env
```

#### **2. Docker Compose Environment**

```yaml
# docker/docker-compose.yml
backend:
  env_file:
    - ../.env # Loads variables from .env file
```

#### **3. Backend Code Fallbacks**

```typescript
// backend/app.ts
const defaultPassword = Deno.env.get("DEFAULT_ADMIN_PASSWORD") || "admin123";

// backend/controllers.ts
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "fallback-secret";
```

## 🚀 **How to Set Up Environment Variables**

### **Step 1: Create .env File**

```bash
# From the project root
cp env.example .env
```

### **Step 2: Edit .env File**

```bash
# Edit .env with your secure values
nano .env
# or
code .env
```

### **Step 3: Set Secure Values**

```env
# .env file content
FRONTEND_ORIGIN=http://localhost:3000

# Generate a strong JWT secret (64+ characters)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-at-least-64-characters-long

# Change this immediately after setup
DEFAULT_ADMIN_PASSWORD=change-this-immediately

# Optional: Custom database path
DATABASE_PATH=/data/data.db
```

### **Step 4: Restart Services**

```bash
cd docker
docker-compose down
docker-compose up -d
```

## 🔒 **Security Best Practices**

### **1. Generate Strong JWT Secret**

```bash
# Generate a secure random string
openssl rand -base64 64

# Or use a password generator
# Example: 128-character random string
```

### **2. Use Strong Admin Password**

```bash
# Generate a secure password
openssl rand -base64 32

# Or use a password manager
# Minimum: 12 characters, mix of letters, numbers, symbols
```

### **3. Environment-Specific Files**

```bash
# Development
.env.development

# Production
.env.production

# Testing
.env.test
```

## 🐳 **Docker Environment Variables**

### **Option 1: .env File (Recommended)**

```yaml
# docker-compose.yml
backend:
  env_file:
    - ../.env
```

### **Option 2: Direct Environment Variables**

```yaml
# docker-compose.yml
backend:
  environment:
    - JWT_SECRET=${JWT_SECRET}
    - DEFAULT_ADMIN_PASSWORD=${DEFAULT_ADMIN_PASSWORD}
    - FRONTEND_ORIGIN=${FRONTEND_ORIGIN}
```

### **Option 3: Docker Secrets (Production)**

```yaml
# docker-compose.yml
backend:
  secrets:
    - jwt_secret
    - admin_password

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  admin_password:
    file: ./secrets/admin_password.txt
```

## 🔍 **Verifying Environment Variables**

### **Check if Variables Are Loaded**

```bash
# Check backend logs
docker-compose logs backend

# Should see: "Admin user created with default password"
# Should NOT see the actual password in logs
```

### **Test Environment Variables**

```bash
# Access backend container
docker-compose exec backend sh

# Check environment variables
echo $JWT_SECRET
echo $DEFAULT_ADMIN_PASSWORD
```

## ⚠️ **Important Security Notes**

1. **NEVER commit .env files** to version control
2. **NEVER use default passwords** in production
3. **ALWAYS use strong, unique secrets**
4. **REGULARLY rotate secrets** and passwords
5. **USE different secrets** for different environments

## 🛠️ **Troubleshooting**

### **Environment Variables Not Loading**

```bash
# Check if .env file exists
ls -la .env

# Check file permissions
chmod 600 .env

# Restart containers
docker-compose restart backend
```

### **Permission Denied**

```bash
# Fix file permissions
chmod 600 .env
chown $USER:$USER .env
```

### **Variables Not Available in Container**

```bash
# Check docker-compose.yml env_file path
# Should be: env_file: - ../.env

# Verify .env file location
# Should be in project root, not in docker/ directory
```
