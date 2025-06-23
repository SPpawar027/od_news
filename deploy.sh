#!/bin/bash

# OD News VPS Deployment Script
# Ubuntu server deployment with PM2 and Nginx

set -e

echo "🚀 Starting OD News deployment..."

# Variables
APP_NAME="od-news"
DOMAIN="your-domain.com"  # Replace with your actual domain
APP_DIR="/var/www/$APP_NAME"
USER="ubuntu"  # Change if different user
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js
print_status "Installing Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
print_status "Installing PM2..."
sudo npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx

# Install PostgreSQL
print_status "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Create logs directory
mkdir -p $APP_DIR/logs

print_status "✅ System setup complete!"
print_warning "Next steps:"
echo "1. Copy your project files to $APP_DIR"
echo "2. Set up environment variables"
echo "3. Run the build and start script"
echo "4. Configure Nginx with your domain"