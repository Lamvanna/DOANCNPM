#!/bin/bash

# Na Food Development Startup Script
echo "🚀 Starting Na Food Development Environment..."

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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/.."

print_status "Checking project structure..."

# Check if required files exist
required_files=(
    "docker-compose.dev.yml"
    "backend/package.json"
    "frontend/index.html"
    "nginx.dev.conf"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file $file not found!"
        exit 1
    fi
done

print_success "Project structure is valid"

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down

# Remove orphaned containers
docker-compose -f docker-compose.dev.yml down --remove-orphans

# Pull latest images
print_status "Pulling latest Docker images..."
docker-compose -f docker-compose.dev.yml pull

# Build and start services
print_status "Building and starting services..."
docker-compose -f docker-compose.dev.yml up -d --build

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check if services are running
services=("backend" "frontend" "redis")
all_running=true

for service in "${services[@]}"; do
    if docker-compose -f docker-compose.dev.yml ps | grep -q "${service}.*Up"; then
        print_success "$service is running"
    else
        print_error "$service failed to start"
        all_running=false
    fi
done

if [ "$all_running" = true ]; then
    print_success "All services are running successfully!"
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:5000"
    echo "   Database: MongoDB Atlas (Cloud)"
    echo "   Redis: localhost:6379"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "   Stop services: docker-compose -f docker-compose.dev.yml down"
    echo "   Restart services: docker-compose -f docker-compose.dev.yml restart"
    echo ""
    echo "🎉 Development environment is ready!"
else
    print_error "Some services failed to start. Check the logs:"
    echo "docker-compose -f docker-compose.dev.yml logs"
    exit 1
fi
