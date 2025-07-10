#!/bin/bash

# Na Food Production Startup Script
echo "🚀 Starting Na Food Production Environment..."

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

# Check if running as root (recommended for production)
if [ "$EUID" -ne 0 ]; then
    print_warning "Running as non-root user. Some operations may require sudo."
fi

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

print_status "Checking production environment..."

# Check if .env.prod file exists
if [ ! -f ".env.prod" ]; then
    print_error ".env.prod file not found!"
    print_status "Creating .env.prod template..."
    cat > .env.prod << EOF
# Production Environment Variables
JWT_SECRET=your_super_secure_jwt_secret_here_change_this
CORS_ORIGIN=https://yourdomain.com
REDIS_PASSWORD=your_secure_redis_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EOF
    print_warning "Please edit .env.prod with your production values before continuing."
    exit 1
fi

# Load environment variables
set -a
source .env.prod
set +a

# Validate required environment variables
required_vars=("JWT_SECRET" "REDIS_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in .env.prod"
        exit 1
    fi
done

print_success "Environment variables validated"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs backup ssl

# Check SSL certificates
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    print_warning "SSL certificates not found. HTTPS will not be available."
    print_status "To enable HTTPS, place your SSL certificates in the ssl/ directory:"
    print_status "  ssl/cert.pem (certificate)"
    print_status "  ssl/key.pem (private key)"
fi

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove orphaned containers
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Pull latest images
print_status "Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull

# Build and start services
print_status "Building and starting production services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check if services are running
services=("backend" "frontend" "redis")
all_running=true

for service in "${services[@]}"; do
    if docker-compose -f docker-compose.prod.yml ps | grep -q "${service}.*Up"; then
        print_success "$service is running"
    else
        print_error "$service failed to start"
        all_running=false
    fi
done

if [ "$all_running" = true ]; then
    print_success "All services are running successfully!"
    echo ""
    echo "🌐 Production URLs:"
    echo "   Frontend: http://localhost (or your domain)"
    if [ -f "ssl/cert.pem" ]; then
        echo "   HTTPS: https://localhost (or your domain)"
    fi
    echo ""
    echo "📋 Production commands:"
    echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "   Stop services: docker-compose -f docker-compose.prod.yml down"
    echo "   Restart services: docker-compose -f docker-compose.prod.yml restart"
    echo "   Scale backend: docker-compose -f docker-compose.prod.yml up -d --scale backend=3"
    echo ""
    echo "🔒 Security reminders:"
    echo "   - Change default passwords"
    echo "   - Set up SSL certificates"
    echo "   - Configure firewall"
    echo "   - Set up monitoring"
    echo ""
    echo "🎉 Production environment is ready!"
else
    print_error "Some services failed to start. Check the logs:"
    echo "docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi
