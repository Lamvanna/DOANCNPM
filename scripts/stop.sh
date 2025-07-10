#!/bin/bash

# Na Food Stop Script
echo "🛑 Stopping Na Food Services..."

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

# Function to stop services
stop_services() {
    local compose_file=$1
    local env_name=$2
    
    if [ -f "$compose_file" ]; then
        print_status "Stopping $env_name services..."
        docker-compose -f "$compose_file" down
        
        if [ $? -eq 0 ]; then
            print_success "$env_name services stopped successfully"
        else
            print_error "Failed to stop $env_name services"
        fi
    else
        print_warning "$compose_file not found, skipping $env_name"
    fi
}

# Check command line arguments
case "$1" in
    "dev"|"development")
        stop_services "docker-compose.dev.yml" "development"
        ;;
    "prod"|"production")
        stop_services "docker-compose.prod.yml" "production"
        ;;
    "all"|"")
        print_status "Stopping all environments..."
        stop_services "docker-compose.dev.yml" "development"
        stop_services "docker-compose.prod.yml" "production"
        stop_services "docker-compose.yml" "default"
        ;;
    "clean")
        print_status "Stopping all services and cleaning up..."
        
        # Stop all compose files
        stop_services "docker-compose.dev.yml" "development"
        stop_services "docker-compose.prod.yml" "production"
        stop_services "docker-compose.yml" "default"
        
        # Remove orphaned containers
        print_status "Removing orphaned containers..."
        docker-compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null
        docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null
        docker-compose down --remove-orphans 2>/dev/null
        
        # Clean up unused Docker resources
        print_status "Cleaning up unused Docker resources..."
        docker system prune -f
        
        print_success "Cleanup completed"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Options:"
        echo "  dev, development    Stop development environment"
        echo "  prod, production    Stop production environment"
        echo "  all                 Stop all environments (default)"
        echo "  clean               Stop all and clean up Docker resources"
        echo "  help                Show this help message"
        echo ""
        exit 0
        ;;
    *)
        print_error "Unknown option: $1"
        print_status "Use '$0 help' for usage information"
        exit 1
        ;;
esac

print_success "Stop operation completed"
