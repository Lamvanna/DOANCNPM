# Na Food Makefile
# Simplified commands for development and production

.PHONY: help dev prod stop clean backup logs install test

# Default target
help:
	@echo "🍽️  Na Food - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev          Start development environment"
	@echo "  make dev-logs     View development logs"
	@echo "  make dev-stop     Stop development environment"
	@echo ""
	@echo "Production:"
	@echo "  make prod         Start production environment"
	@echo "  make prod-logs    View production logs"
	@echo "  make prod-stop    Stop production environment"
	@echo ""
	@echo "General:"
	@echo "  make stop         Stop all environments"
	@echo "  make clean        Stop all and clean Docker resources"
	@echo "  make backup       Backup running environment"
	@echo "  make install      Install dependencies"
	@echo "  make test         Run tests"
	@echo ""
	@echo "Utilities:"
	@echo "  make shell        Access backend container shell"
	@echo "  make db           Access MongoDB shell"
	@echo "  make redis        Access Redis CLI"
	@echo "  make status       Show container status"

# Development commands
dev:
	@echo "🚀 Starting development environment..."
	@chmod +x scripts/start-dev.sh
	@./scripts/start-dev.sh

dev-logs:
	@docker-compose -f docker-compose.dev.yml logs -f

dev-stop:
	@echo "🛑 Stopping development environment..."
	@docker-compose -f docker-compose.dev.yml down

dev-restart:
	@echo "🔄 Restarting development environment..."
	@docker-compose -f docker-compose.dev.yml restart

dev-build:
	@echo "🔨 Rebuilding development environment..."
	@docker-compose -f docker-compose.dev.yml up -d --build

# Production commands
prod:
	@echo "🚀 Starting production environment..."
	@chmod +x scripts/start-prod.sh
	@./scripts/start-prod.sh

prod-logs:
	@docker-compose -f docker-compose.prod.yml logs -f

prod-stop:
	@echo "🛑 Stopping production environment..."
	@docker-compose -f docker-compose.prod.yml down

prod-restart:
	@echo "🔄 Restarting production environment..."
	@docker-compose -f docker-compose.prod.yml restart

prod-build:
	@echo "🔨 Rebuilding production environment..."
	@docker-compose -f docker-compose.prod.yml up -d --build

# General commands
stop:
	@echo "🛑 Stopping all environments..."
	@chmod +x scripts/stop.sh
	@./scripts/stop.sh all

clean:
	@echo "🧹 Cleaning up Docker resources..."
	@chmod +x scripts/stop.sh
	@./scripts/stop.sh clean

backup:
	@echo "💾 Creating backup..."
	@chmod +x scripts/backup.sh
	@./scripts/backup.sh auto

backup-dev:
	@echo "💾 Creating development backup..."
	@chmod +x scripts/backup.sh
	@./scripts/backup.sh dev

backup-prod:
	@echo "💾 Creating production backup..."
	@chmod +x scripts/backup.sh
	@./scripts/backup.sh prod

# Installation and setup
install:
	@echo "📦 Installing dependencies..."
	@cd backend && npm install
	@echo "✅ Dependencies installed"

install-dev:
	@echo "📦 Installing development dependencies..."
	@cd backend && npm install --include=dev
	@echo "✅ Development dependencies installed"

# Testing
test:
	@echo "🧪 Running tests..."
	@cd backend && npm test

test-watch:
	@echo "🧪 Running tests in watch mode..."
	@cd backend && npm run test:watch

# Utility commands
shell:
	@echo "🐚 Accessing backend container shell..."
	@docker-compose -f docker-compose.dev.yml exec backend sh

shell-prod:
	@echo "🐚 Accessing production backend container shell..."
	@docker-compose -f docker-compose.prod.yml exec backend sh

db:
	@echo "🗄️  Accessing MongoDB shell..."
	@docker-compose -f docker-compose.dev.yml exec mongo mongo nafood

db-prod:
	@echo "🗄️  Accessing production MongoDB shell..."
	@docker-compose -f docker-compose.prod.yml exec mongo mongo -u $(MONGO_ROOT_USERNAME) -p $(MONGO_ROOT_PASSWORD) --authenticationDatabase admin nafood

redis:
	@echo "📊 Accessing Redis CLI..."
	@docker-compose -f docker-compose.dev.yml exec redis redis-cli

redis-prod:
	@echo "📊 Accessing production Redis CLI..."
	@docker-compose -f docker-compose.prod.yml exec redis redis-cli -a $(REDIS_PASSWORD)

status:
	@echo "📊 Container Status:"
	@echo ""
	@echo "Development:"
	@docker-compose -f docker-compose.dev.yml ps 2>/dev/null || echo "  No development containers running"
	@echo ""
	@echo "Production:"
	@docker-compose -f docker-compose.prod.yml ps 2>/dev/null || echo "  No production containers running"

# Logs
logs:
	@echo "📋 Recent logs from all environments:"
	@docker-compose -f docker-compose.dev.yml logs --tail=50 2>/dev/null || true
	@docker-compose -f docker-compose.prod.yml logs --tail=50 2>/dev/null || true

# Health checks
health:
	@echo "🏥 Health Check:"
	@echo "Backend API:"
	@curl -s http://localhost:5000/health || echo "  Backend not responding"
	@echo ""
	@echo "Frontend:"
	@curl -s -o /dev/null -w "  Status: %{http_code}\n" http://localhost:3000 || echo "  Frontend not responding"

# Database operations
db-seed:
	@echo "🌱 Seeding database with sample data..."
	@docker-compose -f docker-compose.dev.yml exec backend npm run seed

db-reset:
	@echo "🔄 Resetting database..."
	@docker-compose -f docker-compose.dev.yml exec mongo mongo nafood --eval "db.dropDatabase()"
	@echo "Database reset complete"

# SSL setup for production
ssl-setup:
	@echo "🔒 Setting up SSL certificates..."
	@mkdir -p ssl
	@echo "Place your SSL certificates in the ssl/ directory:"
	@echo "  ssl/cert.pem (certificate)"
	@echo "  ssl/key.pem (private key)"

# Environment setup
env-setup:
	@echo "⚙️  Setting up environment files..."
	@cp backend/.env backend/.env.example 2>/dev/null || true
	@echo "Edit backend/.env with your configuration"

# Quick start for new developers
quick-start:
	@echo "🚀 Quick start for new developers..."
	@make install
	@make env-setup
	@make dev
	@echo ""
	@echo "🎉 Setup complete! Visit http://localhost:3000"

# Update and rebuild
update:
	@echo "🔄 Updating and rebuilding..."
	@git pull
	@make clean
	@make install
	@make dev-build

# Production deployment
deploy:
	@echo "🚀 Deploying to production..."
	@make backup-prod || true
	@make prod-stop
	@make prod-build
	@echo "🎉 Deployment complete!"
