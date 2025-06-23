#!/bin/bash

# Build and Deploy Script for OD News
# Run this script after copying project files to your VPS

set -e

APP_DIR="/var/www/od-news"
APP_NAME="od-news"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Navigate to app directory
cd $APP_DIR

print_status "Installing dependencies..."
npm ci --production=false

print_status "Building React frontend..."
npm run build

print_status "Setting up environment for production..."

# Create .env.production if it doesn't exist
if [ ! -f .env.production ]; then
    print_warning "Creating .env.production template..."
    cat > .env.production << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/od_news
SESSION_SECRET=your-super-secure-session-secret-here
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
OPENAI_API_KEY=your-openai-api-key
EOF
    print_warning "Please edit .env.production with your actual values!"
fi

print_status "Running database migrations..."
npm run db:push

print_status "Setting up PM2..."
# Stop existing process if running
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

print_status "Setting up log rotation..."
sudo pm2 logrotate -u $USER

print_status "✅ Deployment completed successfully!"
print_status "Application is running on port 3000"
print_status "Check status with: pm2 status"
print_status "View logs with: pm2 logs $APP_NAME"