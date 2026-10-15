#!/bin/bash

# Blog Backup Script for PKN-Portafolio
# This script creates automated backups of the blog database

# Configuration
BACKUP_DIR="./backups"
DB_PATH="/data/data.db"
MAX_BACKUPS=30
LOG_FILE="./backup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Create backup directory if it doesn't exist
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# Create timestamp for backup files
get_timestamp() {
    date +"%Y%m%d_%H%M%S"
}

# Create full database backup
create_full_backup() {
    local timestamp=$(get_timestamp)
    local backup_file="$BACKUP_DIR/blog_backup_${timestamp}.db"
    
    log "Creating full database backup: $backup_file"
    
    if cp "$DB_PATH" "$backup_file"; then
        log "✅ Full backup created successfully"
        echo "$backup_file"
    else
        error "Failed to create full backup"
        return 1
    fi
}

# Export blog posts to SQL
export_sql() {
    local timestamp=$(get_timestamp)
    local sql_file="$BACKUP_DIR/blog_posts_${timestamp}.sql"
    
    log "Exporting blog posts to SQL: $sql_file"
    
    # Check if sqlite3 is available
    if ! command -v sqlite3 &> /dev/null; then
        warning "sqlite3 not found, skipping SQL export"
        return 1
    fi
    
    # Create SQL export
    sqlite3 "$DB_PATH" ".dump blog" > "$sql_file" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        log "✅ SQL export created successfully"
        echo "$sql_file"
    else
        error "Failed to create SQL export"
        return 1
    fi
}

# Export blog posts to JSON (using a simple approach)
export_json() {
    local timestamp=$(get_timestamp)
    local json_file="$BACKUP_DIR/blog_posts_${timestamp}.json"
    
    log "Exporting blog posts to JSON: $json_file"
    
    # Check if sqlite3 is available
    if ! command -v sqlite3 &> /dev/null; then
        warning "sqlite3 not found, skipping JSON export"
        return 1
    fi
    
    # Create JSON export using sqlite3
    sqlite3 "$DB_PATH" -json "SELECT * FROM blog ORDER BY created_at DESC;" > "$json_file" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        log "✅ JSON export created successfully"
        echo "$json_file"
    else
        error "Failed to create JSON export"
        return 1
    fi
}

# Clean old backups
clean_old_backups() {
    log "Cleaning old backups (keeping last $MAX_BACKUPS)"
    
    # Count total backup files
    local total_backups=$(find "$BACKUP_DIR" -name "blog_backup_*.db" | wc -l)
    
    if [ "$total_backups" -gt "$MAX_BACKUPS" ]; then
        local to_delete=$((total_backups - MAX_BACKUPS))
        log "Removing $to_delete old backup(s)"
        
        # Remove oldest backups
        find "$BACKUP_DIR" -name "blog_backup_*.db" -printf '%T@ %p\n' | \
        sort -n | head -n "$to_delete" | cut -d' ' -f2- | xargs rm -f
        
        log "✅ Old backups cleaned"
    else
        log "No old backups to clean"
    fi
}

# List all backups
list_backups() {
    log "Listing all backups:"
    echo "===================="
    
    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -name "blog_backup_*.db" -printf '%T@ %s %p\n' | \
        sort -n | while read timestamp size file; do
            date=$(date -d "@$timestamp" '+%Y-%m-%d %H:%M:%S')
            size_kb=$((size / 1024))
            echo "$(basename "$file") (${size_kb}KB) - $date"
        done
        
        local count=$(find "$BACKUP_DIR" -name "blog_backup_*.db" | wc -l)
        echo "Total backups: $count"
    else
        echo "No backup directory found"
    fi
}

# Show backup statistics
show_stats() {
    log "Backup Statistics:"
    echo "=================="
    
    if [ -d "$BACKUP_DIR" ]; then
        local total_backups=$(find "$BACKUP_DIR" -name "blog_backup_*.db" | wc -l)
        local total_size=$(find "$BACKUP_DIR" -name "blog_backup_*.db" -printf '%s\n' | awk '{sum+=$1} END {print sum}')
        local size_kb=$((total_size / 1024))
        
        echo "Total backups: $total_backups"
        echo "Total size: ${size_kb}KB"
        
        if [ "$total_backups" -gt 0 ]; then
            local oldest=$(find "$BACKUP_DIR" -name "blog_backup_*.db" -printf '%T@ %p\n' | sort -n | head -n1 | cut -d' ' -f2-)
            local newest=$(find "$BACKUP_DIR" -name "blog_backup_*.db" -printf '%T@ %p\n' | sort -n | tail -n1 | cut -d' ' -f2-)
            
            echo "Oldest backup: $(basename "$oldest")"
            echo "Newest backup: $(basename "$newest")"
        fi
    else
        echo "No backup directory found"
    fi
}

# Main function
main() {
    local command="${1:-backup}"
    
    log "Starting blog backup system"
    
    case "$command" in
        "backup"|"full")
            create_backup_dir
            create_full_backup
            export_sql
            export_json
            clean_old_backups
            log "✅ Comprehensive backup completed"
            ;;
        "sql")
            create_backup_dir
            export_sql
            ;;
        "json")
            create_backup_dir
            export_json
            ;;
        "list")
            list_backups
            ;;
        "stats")
            show_stats
            ;;
        "clean")
            clean_old_backups
            ;;
        "help")
            echo "
📚 Blog Backup Script - Usage Guide
==================================

Commands:
  backup, full    - Create comprehensive backup (DB + SQL + JSON)
  sql            - Export blog posts to SQL only
  json           - Export blog posts to JSON only
  list           - List all available backups
  stats          - Show backup statistics
  clean          - Clean old backups (keep last $MAX_BACKUPS)
  help           - Show this help message

Examples:
  ./backup.sh backup
  ./backup.sh list
  ./backup.sh stats

Backup Location: $BACKUP_DIR/
Log File: $LOG_FILE

For automated backups, add to crontab:
  0 2 * * * /path/to/backup.sh backup
            "
            ;;
        *)
            error "Unknown command: $command"
            echo "Run './backup.sh help' for usage information"
            exit 1
            ;;
    esac
    
    log "Backup operation completed"
}

# Run main function with all arguments
main "$@" 