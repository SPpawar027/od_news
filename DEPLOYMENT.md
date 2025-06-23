# OD News VPS Deployment Guide

Complete deployment guide for Ubuntu VPS with PM2, Nginx, and SSL.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Process Manager**: PM2
- **Web Server**: Nginx
- **SSL**: Let's Encrypt

## Prerequisites

1. Ubuntu VPS (20.04 LTS or newer)
2. Domain name pointed to your VPS IP
3. Non-root user with sudo privileges
4. PostgreSQL database (local or remote)

## Step 1: Initial Server Setup

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run initial setup (installs Node.js, PM2, Nginx, PostgreSQL)
./deploy.sh
```

## Step 2: Database Setup

If using local PostgreSQL:

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE od_news;
CREATE USER od_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE od_news TO od_user;
\q
```

## Step 3: Project Deployment

1. **Upload project files** to `/var/www/od-news/`:
   ```bash
   # Using rsync (recommended)
   rsync -avz --exclude node_modules --exclude .git ./ user@your-server:/var/www/od-news/
   
   # Or using scp
   scp -r ./ user@your-server:/var/www/od-news/
   ```

2. **Run build and deployment**:
   ```bash
   # SSH into your server
   ssh user@your-server
   
   # Navigate to app directory
   cd /var/www/od-news
   
   # Make scripts executable
   chmod +x build-and-deploy.sh
   
   # Run deployment
   ./build-and-deploy.sh
   ```

3. **Configure environment variables**:
   ```bash
   # Edit the production environment file
   nano .env.production
   ```
   
   Update with your actual values:
   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://od_user:your_secure_password@localhost:5432/od_news
   SESSION_SECRET=your-super-secure-session-secret-minimum-32-characters
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   OPENAI_API_KEY=your-openai-api-key
   ```

## Step 4: SSL and Nginx Setup

1. **Edit SSL setup script**:
   ```bash
   nano ssl-setup.sh
   ```
   Update domain and email variables.

2. **Run SSL setup**:
   ```bash
   chmod +x ssl-setup.sh
   ./ssl-setup.sh
   ```

## Step 5: Verification

1. **Check PM2 status**:
   ```bash
   pm2 status
   pm2 logs od-news
   ```

2. **Check Nginx**:
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

3. **Test application**:
   - HTTP: `http://your-domain.com` (should redirect to HTTPS)
   - HTTPS: `https://your-domain.com`

## Management Commands

### PM2 Process Management
```bash
# Check status
pm2 status

# View logs
pm2 logs od-news

# Restart application
pm2 restart od-news

# Stop application
pm2 stop od-news

# Monitor in real-time
pm2 monit
```

### Application Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
npm run build
pm2 restart od-news
```

### Database Operations
```bash
# Run migrations
npm run db:push

# Backup database
pg_dump -U od_user -h localhost od_news > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
psql -U od_user -h localhost od_news < backup_file.sql
```

### Nginx Operations
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Check logs
sudo tail -f /var/log/nginx/od-news-error.log
sudo tail -f /var/log/nginx/od-news-access.log
```

## Security Considerations

1. **Firewall setup**:
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

2. **Regular updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **SSL certificate renewal** (automatic with certbot timer)

4. **Database security**:
   - Use strong passwords
   - Consider connection encryption
   - Regular backups

## Monitoring and Logs

- **Application logs**: `pm2 logs od-news`
- **Nginx access logs**: `/var/log/nginx/od-news-access.log`
- **Nginx error logs**: `/var/log/nginx/od-news-error.log`
- **System logs**: `journalctl -u nginx`

## Troubleshooting

### Common Issues

1. **Application not starting**:
   ```bash
   pm2 logs od-news
   # Check for missing environment variables or database connection issues
   ```

2. **502 Bad Gateway**:
   ```bash
   # Check if PM2 process is running
   pm2 status
   
   # Restart if needed
   pm2 restart od-news
   ```

3. **SSL issues**:
   ```bash
   # Renew certificate manually
   sudo certbot renew
   ```

4. **Database connection**:
   ```bash
   # Test database connection
   psql -U od_user -h localhost -d od_news
   ```

## Performance Optimization

1. **PM2 clustering** (already configured in ecosystem.config.js)
2. **Nginx caching** and **gzip compression** (configured in nginx.conf)
3. **Database indexing** (review Drizzle schema)
4. **CDN integration** for static assets (optional)

## Backup Strategy

1. **Database backups**:
   ```bash
   # Create backup script
   cat > /home/ubuntu/backup.sh << 'EOF'
   #!/bin/bash
   pg_dump -U od_user -h localhost od_news > /backup/od_news_$(date +%Y%m%d_%H%M%S).sql
   find /backup -name "od_news_*.sql" -mtime +7 -delete
   EOF
   
   chmod +x /home/ubuntu/backup.sh
   
   # Add to crontab for daily backups
   echo "0 2 * * * /home/ubuntu/backup.sh" | crontab -
   ```

2. **Application backups**: Regular git commits and deployments

Your OD News application is now ready for production deployment on your VPS!