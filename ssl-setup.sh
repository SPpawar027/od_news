#!/bin/bash

# SSL Setup Script for OD News with Let's Encrypt
# Run this after configuring your domain DNS

set -e

DOMAIN="your-domain.com"  # Replace with your actual domain
EMAIL="your-email@example.com"  # Replace with your email

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

# Check if domain is provided
if [ "$DOMAIN" = "your-domain.com" ]; then
    print_error "Please edit this script and set your actual domain name"
    exit 1
fi

print_status "Installing Certbot for Let's Encrypt..."
sudo apt install -y certbot python3-certbot-nginx

print_status "Setting up Nginx configuration..."
sudo cp nginx.conf /etc/nginx/sites-available/od-news

# Replace placeholder domain with actual domain
sudo sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/od-news

# Enable the site
sudo ln -sf /etc/nginx/sites-available/od-news /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

print_status "Testing Nginx configuration..."
sudo nginx -t

print_status "Restarting Nginx..."
sudo systemctl restart nginx

print_status "Obtaining SSL certificate..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --no-eff-email

print_status "Setting up automatic renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

print_status "✅ SSL setup completed!"
print_status "Your site should now be accessible at https://$DOMAIN"
print_warning "Make sure your DNS A records point to this server's IP address"