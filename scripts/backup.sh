#!/bin/bash

# Na Food Backup Script
echo "💾 Na Food Backup Utility..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Navigate to project root
cd "$(dirname "$0")/.."

# Create backup directory if it doesn't exist
mkdir -p backup

# Get current timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backup/nafood_backup_$TIMESTAMP"

# Function to backup database
backup_database() {
    local env=$1
    local compose_file=$2
    
    print_status "Backing up MongoDB database ($env)..."
    
    # Note: Using MongoDB Atlas - backup will be done via mongodump with connection string
    print_status "Connecting to MongoDB Atlas for backup..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR/database"
    
    # Perform database backup using MongoDB Atlas connection
    # Note: This requires mongodump to be installed locally or in a container
    print_status "Creating MongoDB Atlas backup..."

    # Use mongodump with Atlas connection string
    MONGO_URI="mongodb+srv://admin:UTEIjifcllB420pH@lamv.tzc1slv.mongodb.net/nafood"

    # Try to use mongodump directly (if available)
    if command -v mongodump &> /dev/null; then
        mongodump --uri="$MONGO_URI" --out "$BACKUP_DIR/database/"
    else
        # Use Docker container with mongodump
        docker run --rm -v "$PWD/$BACKUP_DIR/database:/backup" mongo:7.0 \
            mongodump --uri="$MONGO_URI" --out /backup/
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Database backup completed"
    else
        print_error "Database backup failed"
        return 1
    fi
}

# Function to backup uploads
backup_uploads() {
    print_status "Backing up uploaded files..."
    
    if [ -d "backend/uploads" ]; then
        mkdir -p "$BACKUP_DIR/uploads"
        cp -r backend/uploads/* "$BACKUP_DIR/uploads/" 2>/dev/null
        print_success "Uploads backup completed"
    else
        print_warning "No uploads directory found"
    fi
}

# Function to backup configuration
backup_config() {
    print_status "Backing up configuration files..."
    
    mkdir -p "$BACKUP_DIR/config"
    
    # Backup important config files
    config_files=(
        "docker-compose.yml"
        "docker-compose.dev.yml"
        "docker-compose.prod.yml"
        "nginx.conf"
        "nginx.dev.conf"
        "nginx.prod.conf"
        "mongo-init.js"
        ".env.example"
    )
    
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "$BACKUP_DIR/config/"
        fi
    done
    
    # Backup environment files (without sensitive data)
    if [ -f ".env" ]; then
        grep -v -E "(PASSWORD|SECRET|KEY)" .env > "$BACKUP_DIR/config/.env.template" 2>/dev/null
    fi
    
    print_success "Configuration backup completed"
}

# Function to create backup archive
create_archive() {
    print_status "Creating backup archive..."
    
    cd backup
    tar -czf "nafood_backup_$TIMESTAMP.tar.gz" "nafood_backup_$TIMESTAMP"
    
    if [ $? -eq 0 ]; then
        # Remove uncompressed backup directory
        rm -rf "nafood_backup_$TIMESTAMP"
        print_success "Backup archive created: backup/nafood_backup_$TIMESTAMP.tar.gz"
    else
        print_error "Failed to create backup archive"
        return 1
    fi
    
    cd ..
}

# Function to cleanup old backups
cleanup_old_backups() {
    local keep_days=${1:-7}
    
    print_status "Cleaning up backups older than $keep_days days..."
    
    find backup -name "nafood_backup_*.tar.gz" -mtime +$keep_days -delete
    
    print_success "Old backups cleaned up"
}

# Main backup function
perform_backup() {
    local env=$1
    local compose_file=$2
    
    print_status "Starting backup for $env environment..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    if ! backup_database "$env" "$compose_file"; then
        print_error "Backup failed during database backup"
        return 1
    fi
    
    # Backup uploads
    backup_uploads
    
    # Backup configuration
    backup_config
    
    # Create archive
    if ! create_archive; then
        print_error "Backup failed during archive creation"
        return 1
    fi
    
    # Cleanup old backups
    cleanup_old_backups 7
    
    print_success "Backup completed successfully!"
    echo "Backup location: backup/nafood_backup_$TIMESTAMP.tar.gz"
}

# Check command line arguments
case "$1" in
    "dev"|"development")
        if [ -f "docker-compose.dev.yml" ]; then
            perform_backup "development" "docker-compose.dev.yml"
        else
            print_error "docker-compose.dev.yml not found"
            exit 1
        fi
        ;;
    "prod"|"production")
        if [ -f "docker-compose.prod.yml" ]; then
            # Load production environment variables
            if [ -f ".env.prod" ]; then
                set -a
                source .env.prod
                set +a
            fi
            perform_backup "production" "docker-compose.prod.yml"
        else
            print_error "docker-compose.prod.yml not found"
            exit 1
        fi
        ;;
    "auto")
        # Automatic backup - detect which environment is running
        if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
            print_status "Detected production environment"
            if [ -f ".env.prod" ]; then
                set -a
                source .env.prod
                set +a
            fi
            perform_backup "production" "docker-compose.prod.yml"
        elif docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
            print_status "Detected development environment"
            perform_backup "development" "docker-compose.dev.yml"
        else
            print_error "No running environment detected"
            exit 1
        fi
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Options:"
        echo "  dev, development    Backup development environment"
        echo "  prod, production    Backup production environment"
        echo "  auto                Auto-detect and backup running environment"
        echo "  help                Show this help message"
        echo ""
        echo "The backup will include:"
        echo "  - MongoDB database dump"
        echo "  - Uploaded files"
        echo "  - Configuration files"
        echo ""
        echo "Backups are stored in the backup/ directory as compressed archives."
        echo "Old backups (>7 days) are automatically cleaned up."
        exit 0
        ;;
    "")
        print_error "No environment specified"
        print_status "Use '$0 help' for usage information"
        exit 1
        ;;
    *)
        print_error "Unknown option: $1"
        print_status "Use '$0 help' for usage information"
        exit 1
        ;;
esac
