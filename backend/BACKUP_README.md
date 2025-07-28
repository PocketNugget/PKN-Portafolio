# Blog Backup System

This automated backup system protects your blog articles and ensures data safety for your PKN-Portafolio website.

## 📁 Backup Location

All backups are stored in the `./backups/` directory with the following structure:

```
backups/
├── blog_backup_20250127_143022.db    # Full database backup
├── blog_posts_20250127_143022.sql    # SQL export of blog posts
├── blog_posts_20250127_143022.json   # JSON export of blog posts
└── backup.log                        # Backup operation logs
```

## 🚀 Quick Start

### Manual Backup

```bash
# Create a comprehensive backup (recommended)
./backup.sh backup

# List all available backups
./backup.sh list

# Show backup statistics
./backup.sh stats
```

### Automated Backup (Cron)

Add to your crontab for daily backups at 2 AM:

```bash
# Edit crontab
crontab -e

# Add this line
0 2 * * * /path/to/your/project/backend/backup.sh backup
```

## 📋 Available Commands

| Command            | Description                                   |
| ------------------ | --------------------------------------------- |
| `backup` or `full` | Create comprehensive backup (DB + SQL + JSON) |
| `sql`              | Export blog posts to SQL only                 |
| `json`             | Export blog posts to JSON only                |
| `list`             | List all available backups                    |
| `stats`            | Show backup statistics                        |
| `clean`            | Clean old backups (keep last 30)              |
| `help`             | Show help message                             |

## 🔧 Configuration

Edit the configuration variables in `backup.sh`:

```bash
BACKUP_DIR="./backups"     # Backup directory
DB_PATH="/data/data.db"    # Database path
MAX_BACKUPS=30            # Keep last 30 backups
LOG_FILE="./backup.log"   # Log file location
```

## 📊 Backup Types

### 1. Full Database Backup

- **File**: `blog_backup_YYYYMMDD_HHMMSS.db`
- **Content**: Complete SQLite database copy
- **Use**: Full system restore

### 2. SQL Export

- **File**: `blog_posts_YYYYMMDD_HHMMSS.sql`
- **Content**: Blog posts in SQL INSERT format
- **Use**: Database migration, selective restore

### 3. JSON Export

- **File**: `blog_posts_YYYYMMDD_HHMMSS.json`
- **Content**: Blog posts in JSON format
- **Use**: Data analysis, external tools

## 🔒 Security Features

- **Authentication Required**: All backup operations require admin login
- **Protected Endpoints**: Backup API endpoints are secured with JWT
- **Logging**: All backup operations are logged with timestamps
- **Error Handling**: Comprehensive error handling and reporting

## 🌐 API Endpoints

### Create Backup

```http
POST /api/backup
Authorization: Bearer <your-jwt-token>
```

### List Backups

```http
GET /api/backup
Authorization: Bearer <your-jwt-token>
```

### Get Backup Statistics

```http
GET /api/backup/stats
Authorization: Bearer <your-jwt-token>
```

## 📈 Monitoring

### Check Backup Status

```bash
# View backup log
tail -f backup.log

# Check backup statistics
./backup.sh stats

# List recent backups
./backup.sh list
```

### Backup Health Check

```bash
# Verify latest backup integrity
sqlite3 backups/blog_backup_$(ls -t backups/ | grep "blog_backup_" | head -1) "SELECT COUNT(*) FROM blog;"
```

## 🔄 Restore Process

### From Full Backup

```bash
# Stop the application
docker-compose down

# Restore database
cp backups/blog_backup_YYYYMMDD_HHMMSS.db /data/data.db

# Restart application
docker-compose up -d
```

### From SQL Export

```bash
# Create new database
sqlite3 restored.db < backups/blog_posts_YYYYMMDD_HHMMSS.sql
```

## 🛠️ Troubleshooting

### Common Issues

1. **Permission Denied**

   ```bash
   chmod +x backup.sh
   ```

2. **Database Locked**

   ```bash
   # Wait for application to finish writing
   # Or restart the application
   docker-compose restart backend
   ```

3. **Insufficient Space**

   ```bash
   # Clean old backups
   ./backup.sh clean
   ```

4. **Backup Directory Not Found**
   ```bash
   # Create backup directory
   mkdir -p backups
   ```

### Log Analysis

```bash
# View recent backup logs
tail -20 backup.log

# Search for errors
grep "ERROR" backup.log

# Check backup frequency
grep "backup completed" backup.log | tail -10
```

## 📅 Maintenance Schedule

| Task                    | Frequency     | Command              |
| ----------------------- | ------------- | -------------------- |
| Daily Backup            | Daily at 2 AM | `./backup.sh backup` |
| Clean Old Backups       | Weekly        | `./backup.sh clean`  |
| Check Backup Stats      | Monthly       | `./backup.sh stats`  |
| Verify Backup Integrity | Monthly       | Manual verification  |

## 🔐 Best Practices

1. **Test Restores**: Periodically test backup restoration
2. **Monitor Space**: Ensure sufficient disk space for backups
3. **Offsite Backup**: Consider copying backups to external storage
4. **Version Control**: Keep backup scripts in version control
5. **Documentation**: Document any custom backup procedures

## 📞 Support

If you encounter issues with the backup system:

1. Check the backup log: `tail -f backup.log`
2. Verify permissions: `ls -la backup.sh`
3. Test manual backup: `./backup.sh backup`
4. Check disk space: `df -h`

## 🎯 Success Metrics

- ✅ Daily backups completed successfully
- ✅ Backup files are accessible and readable
- ✅ Restore process tested and working
- ✅ Backup size is reasonable (< 100MB for typical blogs)
- ✅ Backup retention policy enforced (30 days)

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: PocketNugget
