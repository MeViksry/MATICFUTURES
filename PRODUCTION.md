# 📚 BITCI FUTURES BOT - Dokumentasi Production Lengkap

## Daftar Isi

1. [Persiapan Server](#1-persiapan-server)
2. [Setup Environment Production](#2-setup-environment-production)
3. [Instalasi Dependencies](#3-instalasi-dependencies)
4. [Konfigurasi Database](#4-konfigurasi-database)
5. [Konfigurasi Nginx & SSL](#5-konfigurasi-nginx--ssl)
6. [Script Start Production](#6-script-start-production)
7. [PM2 Configuration](#7-pm2-configuration)
8. [Docker Deployment](#8-docker-deployment)
9. [Monitoring & Maintenance](#9-monitoring--maintenance)
10. [Backup & Recovery](#10-backup--recovery)
11. [Security Checklist](#11-security-checklist)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Persiapan Server

### 1.1 Minimum Requirements (Production)

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 Core | 4+ Core |
| RAM | 4 GB | 8+ GB |
| Storage | 40 GB SSD | 100+ GB SSD |
| OS | Ubuntu 20.04+ | Ubuntu 22.04 LTS |
| Bandwidth | 100 Mbps | 1 Gbps |

### 1.2 Install Required Software

```bash
#!/bin/bash
# install-requirements.sh

echo "🔧 Installing required software for BITCI Production..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git nano htop unzip build-essential

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js
node --version
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Install PostgreSQL 15
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Redis
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Install Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Install UFW Firewall
sudo apt install -y ufw

echo "✅ All software installed!"
echo ""
echo "Versions:"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  PostgreSQL: $(psql --version)"
echo "  Redis: $(redis-server --version)"
echo "  Nginx: $(nginx -v 2>&1)"
```

---

## 2. Setup Environment Production

### 2.1 Buat User untuk Aplikasi

```bash
# Buat user khusus untuk aplikasi
sudo adduser --disabled-password --gecos "" bitci
sudo usermod -aG sudo bitci

# Buat directory aplikasi
sudo mkdir -p /var/www/bitci-bot
sudo chown -R bitci:bitci /var/www/bitci-bot
```

### 2.2 Clone/Upload Project

```bash
# Login sebagai user bitci
sudo su - bitci

# Clone project (atau upload via SCP/SFTP)
cd /var/www/bitci-bot
git clone https://github.com/yourusername/bitci-futures-bot.git .

# Atau copy dari local
# scp -r ./bitci-bot/* bitci@yourserver:/var/www/bitci-bot/
```

### 2.3 Environment Variables Production

**Backend `.env`:**

```bash
cat > /var/www/bitci-bot/backend/.env << 'EOF'
# ============================================
# BITCI FUTURES BOT - PRODUCTION CONFIG
# ============================================

# Application
NODE_ENV=production
PORT=3001

# Database (Ganti dengan credentials yang aman!)
DATABASE_URL="postgresql://bitci_user:YOUR_SECURE_DB_PASSWORD@localhost:5432/bitci_production?schema=public"

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_SECURE_REDIS_PASSWORD

# JWT (Generate dengan: openssl rand -hex 64)
JWT_SECRET=GENERATE_YOUR_OWN_64_CHAR_SECRET_KEY_HERE_USING_OPENSSL_RAND
JWT_REFRESH_SECRET=GENERATE_ANOTHER_64_CHAR_SECRET_KEY_HERE_FOR_REFRESH
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption Key (HARUS 32 karakter!)
ENCRYPTION_KEY=YOUR_32_CHARACTER_ENCRYPTION_KEY

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM="BITCI Bot <noreply@yourdomain.com>"

# URLs (Ganti dengan domain Anda)
FRONTEND_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
EOF
```

**Frontend `.env`:**

```bash
cat > /var/www/bitci-bot/frontend/.env << 'EOF'
# ============================================
# BITCI FUTURES BOT - FRONTEND PRODUCTION
# ============================================

NUXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NUXT_PUBLIC_WS_URL=wss://api.yourdomain.com
EOF
```

### 2.4 Generate Secure Keys

```bash
# Generate JWT Secret
echo "JWT_SECRET=$(openssl rand -hex 64)"

# Generate Refresh Secret
echo "JWT_REFRESH_SECRET=$(openssl rand -hex 64)"

# Generate Encryption Key (32 chars)
echo "ENCRYPTION_KEY=$(openssl rand -hex 16)"

# Generate Redis Password
echo "REDIS_PASSWORD=$(openssl rand -base64 32)"

# Generate Database Password
echo "DB_PASSWORD=$(openssl rand -base64 24)"
```

---

## 3. Instalasi Dependencies

### 3.1 Install Backend Dependencies

```bash
cd /var/www/bitci-bot/backend

# Install dependencies
npm ci --production=false

# Generate Prisma Client
npx prisma generate

# Build TypeScript
npm run build
```

### 3.2 Install Frontend Dependencies

```bash
cd /var/www/bitci-bot/frontend

# Install dependencies
npm ci

# Build for production
npm run build
```

---

## 4. Konfigurasi Database

### 4.1 Setup PostgreSQL

```bash
# Login sebagai postgres user
sudo -u postgres psql

# Buat user dan database
CREATE USER bitci_user WITH ENCRYPTED PASSWORD 'YOUR_SECURE_DB_PASSWORD';
CREATE DATABASE bitci_production OWNER bitci_user;
GRANT ALL PRIVILEGES ON DATABASE bitci_production TO bitci_user;

# Exit psql
\q
```

### 4.2 Konfigurasi PostgreSQL untuk Production

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf
```

```ini
# Tambahkan/edit:
listen_addresses = 'localhost'
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 768MB
maintenance_work_mem = 128MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 6553kB
min_wal_size = 1GB
max_wal_size = 4GB
```

```bash
# Edit pg_hba.conf untuk security
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

```
# Pastikan hanya local connections yang diizinkan
local   all             all                                     peer
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256
```

```bash
# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 4.3 Run Database Migration

```bash
cd /var/www/bitci-bot/backend

# Run migrations
npx prisma migrate deploy

# Seed database (optional, untuk data awal)
npx prisma db seed
```

---

## 5. Konfigurasi Nginx & SSL

### 5.1 Konfigurasi Nginx

```bash
# Buat konfigurasi Nginx
sudo nano /etc/nginx/sites-available/bitci-bot
```

```nginx
# /etc/nginx/sites-available/bitci-bot

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=webhook_limit:10m rate=100r/s;
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

# Upstream untuk backend
upstream bitci_backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

# Upstream untuk frontend
upstream bitci_frontend {
    server 127.0.0.1:3000;
    keepalive 64;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com api.yourdomain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# Frontend Server (yourdomain.com)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Connection limits
    limit_conn conn_limit 20;

    # Frontend proxy
    location / {
        proxy_pass http://bitci_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}

# API Server (api.yourdomain.com)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration (sama dengan frontend)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # CORS Headers
    add_header Access-Control-Allow-Origin "https://yourdomain.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;
    add_header Access-Control-Allow-Credentials "true" always;

    # Connection limits
    limit_conn conn_limit 50;

    # Client body size (untuk upload)
    client_max_body_size 10M;

    # Health check endpoint
    location /health {
        proxy_pass http://bitci_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }

    # Webhook endpoint (higher rate limit)
    location /api/webhook {
        limit_req zone=webhook_limit burst=50 nodelay;
        
        proxy_pass http://bitci_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 5s;
        proxy_connect_timeout 5s;
    }

    # API endpoints
    location /api {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://bitci_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # WebSocket endpoint
    location /socket.io {
        proxy_pass http://bitci_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }

    # Handle OPTIONS preflight
    location @options {
        add_header Access-Control-Allow-Origin "https://yourdomain.com";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With";
        add_header Access-Control-Allow-Credentials "true";
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }

    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

### 5.2 Enable Site & Test

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/bitci-bot /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 5.3 Setup SSL dengan Let's Encrypt

```bash
# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run

# Setup auto-renewal cron
sudo crontab -e
# Tambahkan:
# 0 0 * * * /usr/bin/certbot renew --quiet
```

---

## 6. Script Start Production

### 6.1 Main Start Script

```bash
cat > /var/www/bitci-bot/start-production.sh << 'EOF'
#!/bin/bash

# ============================================
# BITCI FUTURES BOT - PRODUCTION START SCRIPT
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
APP_DIR="/var/www/bitci-bot"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
LOG_DIR="$APP_DIR/logs"

# Create log directory
mkdir -p $LOG_DIR

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  BITCI FUTURES BOT - PRODUCTION${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Function: Check service status
check_service() {
    local service=$1
    if systemctl is-active --quiet $service; then
        echo -e "${GREEN}✅ $service is running${NC}"
        return 0
    else
        echo -e "${RED}❌ $service is not running${NC}"
        return 1
    fi
}

# Function: Start service
start_service() {
    local service=$1
    echo -e "${YELLOW}Starting $service...${NC}"
    sudo systemctl start $service
    sleep 2
    check_service $service
}

# ==========================================
# PRE-FLIGHT CHECKS
# ==========================================
echo -e "${BLUE}📋 Running pre-flight checks...${NC}"
echo ""

# Check PostgreSQL
if ! check_service postgresql; then
    start_service postgresql
fi

# Check Redis
if ! check_service redis-server; then
    start_service redis-server
fi

# Check Nginx
if ! check_service nginx; then
    start_service nginx
fi

echo ""

# ==========================================
# STOP EXISTING PM2 PROCESSES
# ==========================================
echo -e "${BLUE}🛑 Stopping existing processes...${NC}"
pm2 delete all 2>/dev/null || true
echo ""

# ==========================================
# BUILD APPLICATIONS
# ==========================================
echo -e "${BLUE}🔨 Building applications...${NC}"
echo ""

# Build Backend
echo -e "${YELLOW}Building backend...${NC}"
cd $BACKEND_DIR
npm ci --production=false
npx prisma generate
npm run build
echo -e "${GREEN}✅ Backend built${NC}"
echo ""

# Build Frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd $FRONTEND_DIR
npm ci
npm run build
echo -e "${GREEN}✅ Frontend built${NC}"
echo ""

# ==========================================
# DATABASE MIGRATION
# ==========================================
echo -e "${BLUE}🗄️ Running database migrations...${NC}"
cd $BACKEND_DIR
npx prisma migrate deploy
echo -e "${GREEN}✅ Migrations completed${NC}"
echo ""

# ==========================================
# START WITH PM2
# ==========================================
echo -e "${BLUE}🚀 Starting applications with PM2...${NC}"
echo ""

cd $APP_DIR

# Start all apps with ecosystem config
pm2 start ecosystem.config.js

# Wait for startup
sleep 5

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || true

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ BITCI BOT STARTED SUCCESSFULLY!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Show status
pm2 status

echo ""
echo -e "${CYAN}📊 Useful Commands:${NC}"
echo "  pm2 status          - Check status"
echo "  pm2 logs            - View logs"
echo "  pm2 monit           - Monitor"
echo "  pm2 restart all     - Restart all"
echo "  pm2 stop all        - Stop all"
echo ""
echo -e "${CYAN}🌐 URLs:${NC}"
echo "  Frontend: https://yourdomain.com"
echo "  API:      https://api.yourdomain.com"
echo "  Health:   https://api.yourdomain.com/health"
echo ""
EOF

chmod +x /var/www/bitci-bot/start-production.sh
```

### 6.2 Stop Script

```bash
cat > /var/www/bitci-bot/stop-production.sh << 'EOF'
#!/bin/bash

# ============================================
# BITCI FUTURES BOT - STOP SCRIPT
# ============================================

echo "🛑 Stopping BITCI Futures Bot..."

# Stop PM2 processes
pm2 stop all

echo "✅ All processes stopped"
pm2 status
EOF

chmod +x /var/www/bitci-bot/stop-production.sh
```

### 6.3 Restart Script

```bash
cat > /var/www/bitci-bot/restart-production.sh << 'EOF'
#!/bin/bash

# ============================================
# BITCI FUTURES BOT - RESTART SCRIPT
# ============================================

echo "🔄 Restarting BITCI Futures Bot..."

# Restart PM2 processes
pm2 restart all

echo "✅ All processes restarted"
pm2 status
EOF

chmod +x /var/www/bitci-bot/restart-production.sh
```

### 6.4 Update & Deploy Script

```bash
cat > /var/www/bitci-bot/deploy.sh << 'EOF'
#!/bin/bash

# ============================================
# BITCI FUTURES BOT - DEPLOY/UPDATE SCRIPT
# ============================================

set -e

APP_DIR="/var/www/bitci-bot"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

echo ""
echo "🚀 Deploying BITCI Futures Bot..."
echo ""

# Pull latest changes (if using git)
cd $APP_DIR
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main
fi

# Stop current processes
echo "🛑 Stopping current processes..."
pm2 stop all 2>/dev/null || true

# Update Backend
echo "📦 Updating backend..."
cd $BACKEND_DIR
npm ci --production=false
npx prisma generate
npx prisma migrate deploy
npm run build

# Update Frontend
echo "📦 Updating frontend..."
cd $FRONTEND_DIR
npm ci
npm run build

# Restart with PM2
echo "🚀 Starting services..."
cd $APP_DIR
pm2 restart all

echo ""
echo "✅ Deployment completed!"
pm2 status
EOF

chmod +x /var/www/bitci-bot/deploy.sh
```

### 6.5 Health Check Script

```bash
cat > /var/www/bitci-bot/health-check.sh << 'EOF'
#!/bin/bash

# ============================================
# BITCI FUTURES BOT - HEALTH CHECK
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "🏥 BITCI Health Check"
echo "===================="
echo ""

# Check Backend API
echo -n "Backend API: "
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED (HTTP $BACKEND_STATUS)${NC}"
fi

# Check Frontend
echo -n "Frontend: "
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED (HTTP $FRONTEND_STATUS)${NC}"
fi

# Check PostgreSQL
echo -n "PostgreSQL: "
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not Running${NC}"
fi

# Check Redis
echo -n "Redis: "
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not Running${NC}"
fi

# Check Nginx
echo -n "Nginx: "
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not Running${NC}"
fi

# Check PM2 processes
echo ""
echo "PM2 Processes:"
pm2 jlist 2>/dev/null | jq -r '.[] | "  \(.name): \(.pm2_env.status)"' 2>/dev/null || echo "  Unable to get PM2 status"

# Check disk usage
echo ""
echo "Disk Usage:"
df -h / | tail -1 | awk '{print "  Used: "$3" / "$2" ("$5")"}'

# Check memory
echo ""
echo "Memory Usage:"
free -h | grep Mem | awk '{print "  Used: "$3" / "$2}'

echo ""
EOF

chmod +x /var/www/bitci-bot/health-check.sh
```

---

## 7. PM2 Configuration

### 7.1 Ecosystem Config

```bash
cat > /var/www/bitci-bot/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    // Backend API Server
    {
      name: 'bitci-backend',
      cwd: '/var/www/bitci-bot/backend',
      script: 'dist/app.js',
      instances: 'max', // Gunakan semua CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/www/bitci-bot/logs/backend-error.log',
      out_file: '/var/www/bitci-bot/logs/backend-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
    
    // Backend Worker (untuk processing queue)
    {
      name: 'bitci-worker',
      cwd: '/var/www/bitci-bot/backend',
      script: 'dist/workers/index.js',
      instances: 2, // 2 worker instances
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/www/bitci-bot/logs/worker-error.log',
      out_file: '/var/www/bitci-bot/logs/worker-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    
    // Frontend Nuxt Server
    {
      name: 'bitci-frontend',
      cwd: '/var/www/bitci-bot/frontend',
      script: '.output/server/index.mjs',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      error_file: '/var/www/bitci-bot/logs/frontend-error.log',
      out_file: '/var/www/bitci-bot/logs/frontend-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    }
  ],

  // Deployment configuration (optional, untuk pm2 deploy)
  deploy: {
    production: {
      user: 'bitci',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/bitci-futures-bot.git',
      path: '/var/www/bitci-bot',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
EOF
```

### 7.2 PM2 Logrotate

```bash
# Install pm2-logrotate
pm2 install pm2-logrotate

# Configure logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 10
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
pm2 set pm2-logrotate:rotateModule true
pm2 set pm2-logrotate:workerInterval 30
```

---

## 8. Docker Deployment (Alternative)

### 8.1 Docker Compose Production

```yaml
# /var/www/bitci-bot/docker-compose.prod.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: bitci_postgres
    restart: always
    environment:
      POSTGRES_DB: bitci_production
      POSTGRES_USER: bitci_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    networks:
      - bitci_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bitci_user -d bitci_production"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: bitci_redis
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - bitci_network
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: bitci_backend
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://bitci_user:${DB_PASSWORD}@postgres:5432/bitci_production?schema=public
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      SMTP_FROM: ${SMTP_FROM}
      FRONTEND_URL: ${FRONTEND_URL}
    volumes:
      - ./logs:/app/logs
    networks:
      - bitci_network
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 1G

  # Worker
  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.worker
    container_name: bitci_worker
    restart: always
    depends_on:
      - backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://bitci_user:${DB_PASSWORD}@postgres:5432/bitci_production?schema=public
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
    volumes:
      - ./logs:/app/logs
    networks:
      - bitci_network
    deploy:
      replicas: 2

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: bitci_frontend
    restart: always
    environment:
      NODE_ENV: production
      NUXT_PUBLIC_API_BASE_URL: ${API_URL}
      NUXT_PUBLIC_WS_URL: ${WS_URL}
    networks:
      - bitci_network
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: bitci_nginx
    restart: always
    depends_on:
      - frontend
      - backend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    networks:
      - bitci_network

networks:
  bitci_network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

### 8.2 Docker Commands

```bash
# Build dan start
docker-compose -f docker-compose.prod.yml up -d --build

# Lihat logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down

# Restart
docker-compose -f docker-compose.prod.yml restart

# Scale workers
docker-compose -f docker-compose.prod.yml up -d --scale worker=4
```

---

## 9. Monitoring & Maintenance

### 9.1 Setup Monitoring dengan PM2

```bash
# Install PM2 Plus (optional, untuk web dashboard)
pm2 link YOUR_PUBLIC_KEY YOUR_SECRET_KEY

# Atau gunakan pm2 monit
pm2 monit
```

### 9.2 Cron Jobs untuk Maintenance

```bash
# Edit crontab
crontab -e
```

```bash
# ============================================
# BITCI CRON JOBS
# ============================================

# Health check setiap 5 menit
*/5 * * * * /var/www/bitci-bot/health-check.sh >> /var/www/bitci-bot/logs/health.log 2>&1

# Database backup harian jam 2 pagi
0 2 * * * /var/www/bitci-bot/backup.sh >> /var/www/bitci-bot/logs/backup.log 2>&1

# Clear old logs mingguan
0 3 * * 0 find /var/www/bitci-bot/logs -name "*.log" -mtime +30 -delete

# SSL renewal check
0 0 * * * /usr/bin/certbot renew --quiet

# PM2 flush logs mingguan
0 4 * * 0 pm2 flush

# Restart PM2 mingguan untuk memory cleanup
0 5 * * 0 pm2 restart all
```

### 9.3 Log Rotation System

```bash
# Buat logrotate config
sudo nano /etc/logrotate.d/bitci-bot
```

```
/var/www/bitci-bot/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 bitci bitci
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## 10. Backup & Recovery

### 10.1 Backup Script

```bash
cat > /var/www/bitci-bot/backup.sh << 'EOF'
#!/bin/bash

# ============================================
# BITCI FUTURES BOT - BACKUP SCRIPT
# ============================================

set -e

# Configuration
BACKUP_DIR="/var/www/bitci-bot/backups"
DB_NAME="bitci_production"
DB_USER="bitci_user"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

echo "🔄 Starting backup... ($DATE)"

# Database backup
echo "📦 Backing up database..."
PGPASSWORD=$DB_PASSWORD pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Application files backup (config only)
echo "📦 Backing up configuration..."
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
    /var/www/bitci-bot/backend/.env \
    /var/www/bitci-bot/frontend/.env \
    /var/www/bitci-bot/ecosystem.config.js \
    2>/dev/null || true

# Delete old backups
echo "🗑️ Cleaning old backups..."
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete

# Show backup size
BACKUP_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
echo "✅ Backup completed! Total size: $BACKUP_SIZE"

# List recent backups
echo ""
echo "Recent backups:"
ls -lh $BACKUP_DIR | tail -10
EOF

chmod +x /var/www/bitci-bot/backup.sh
```

### 10.2 Restore Script

```bash
cat > /var/www/bitci-bot/restore.sh << 'EOF'
#!/bin/bash

# ============================================
# BITCI FUTURES BOT - RESTORE SCRIPT
# ============================================

BACKUP_DIR="/var/www/bitci-bot/backups"
DB_NAME="bitci_production"
DB_USER="bitci_user"

echo "Available backups:"
ls -la $BACKUP_DIR/*.sql.gz 2>/dev/null | tail -10

echo ""
read -p "Enter backup filename (e.g., db_20241128_020000.sql.gz): " BACKUP_FILE

if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "❌ Backup file not found!"
    exit 1
fi

echo "⚠️ This will restore the database from: $BACKUP_FILE"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo "🛑 Stopping application..."
pm2 stop all

echo "🔄 Restoring database..."
gunzip -c "$BACKUP_DIR/$BACKUP_FILE" | PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost $DB_NAME

echo "🚀 Starting application..."
pm2 start all

echo "✅ Restore completed!"
EOF

chmod +x /var/www/bitci-bot/restore.sh
```

---

## 11. Security Checklist

### 11.1 Firewall Setup (UFW)

```bash
# Reset UFW
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (PENTING! Jangan sampai terkunci)
sudo ufw allow 22/tcp

# Allow HTTP & HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable UFW
sudo ufw enable

# Check status
sudo ufw status verbose
```

### 11.2 Fail2ban Setup

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Create custom config
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
```

```bash
# Start fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 11.3 Security Checklist

```bash
cat > /var/www/bitci-bot/security-check.sh << 'EOF'
#!/bin/bash

echo "🔒 BITCI Security Check"
echo "======================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "⚠️ WARNING: Running as root is not recommended"
else
    echo "✅ Not running as root"
fi

# Check .env permissions
echo -n "Backend .env permissions: "
BACKEND_ENV_PERM=$(stat -c %a /var/www/bitci-bot/backend/.env 2>/dev/null)
if [ "$BACKEND_ENV_PERM" = "600" ] || [ "$BACKEND_ENV_PERM" = "640" ]; then
    echo "✅ OK ($BACKEND_ENV_PERM)"
else
    echo "⚠️ Should be 600 or 640 (currently $BACKEND_ENV_PERM)"
fi

# Check UFW status
echo -n "Firewall: "
if sudo ufw status | grep -q "Status: active"; then
    echo "✅ Active"
else
    echo "⚠️ Not active"
fi

# Check fail2ban
echo -n "Fail2ban: "
if systemctl is-active --quiet fail2ban; then
    echo "✅ Running"
else
    echo "⚠️ Not running"
fi

# Check SSL certificate
echo -n "SSL Certificate: "
if [ -f "/etc/letsencrypt/live/yourdomain.com/fullchain.pem" ]; then
    EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem | cut -d= -f2)
    echo "✅ Valid until: $EXPIRY"
else
    echo "⚠️ Not found"
fi

# Check open ports
echo ""
echo "Open ports:"
sudo netstat -tlnp | grep LISTEN

echo ""
echo "Security check completed!"
EOF

chmod +x /var/www/bitci-bot/security-check.sh
```

### 11.4 Set Proper Permissions

```bash
# Set ownership
sudo chown -R bitci:bitci /var/www/bitci-bot

# Set directory permissions
find /var/www/bitci-bot -type d -exec chmod 755 {} \;

# Set file permissions
find /var/www/bitci-bot -type f -exec chmod 644 {} \;

# Protect .env files
chmod 600 /var/www/bitci-bot/backend/.env
chmod 600 /var/www/bitci-bot/frontend/.env

# Make scripts executable
chmod 700 /var/www/bitci-bot/*.sh
```

---

## 12. Troubleshooting

### 12.1 Common Issues & Solutions

#### Backend tidak bisa start

```bash
# Check logs
pm2 logs bitci-backend --lines 100

# Check if port is in use
sudo lsof -i :3001

# Kill process using port
sudo kill $(sudo lsof -t -i:3001)
```

#### Database connection error

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U bitci_user -h localhost -d bitci_production

# Check DATABASE_URL di .env
grep DATABASE_URL /var/www/bitci-bot/backend/.env
```

#### Redis connection error

```bash
# Check Redis status
sudo systemctl status redis-server

# Test connection
redis-cli ping

# Test with password
redis-cli -a YOUR_PASSWORD ping
```

#### Nginx 502 Bad Gateway

```bash
# Check if backend is running
curl http://localhost:3001/health

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Check Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew --force-renewal

# Check certificate status
sudo certbot certificates

# Test SSL
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### 12.2 Debug Commands

```bash
# Full system status
cat > /var/www/bitci-bot/debug.sh << 'EOF'
#!/bin/bash

echo "========================================"
echo "BITCI DEBUG INFORMATION"
echo "========================================"
echo ""

echo "=== System Info ==="
uname -a
echo ""

echo "=== Memory Usage ==="
free -h
echo ""

echo "=== Disk Usage ==="
df -h
echo ""

echo "=== PM2 Status ==="
pm2 status
echo ""

echo "=== PM2 Logs (last 50 lines) ==="
pm2 logs --lines 50 --nostream
echo ""

echo "=== PostgreSQL Status ==="
sudo systemctl status postgresql --no-pager
echo ""

echo "=== Redis Status ==="
sudo systemctl status redis-server --no-pager
echo ""

echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager
echo ""

echo "=== Nginx Error Log (last 20 lines) ==="
sudo tail -20 /var/log/nginx/error.log
echo ""

echo "=== Network Ports ==="
sudo netstat -tlnp | grep -E ':(80|443|3000|3001|5432|6379)'
echo ""

echo "=== Environment Check ==="
echo "Backend .env exists: $([ -f /var/www/bitci-bot/backend/.env ] && echo 'Yes' || echo 'No')"
echo "Frontend .env exists: $([ -f /var/www/bitci-bot/frontend/.env ] && echo 'Yes' || echo 'No')"
echo ""
EOF

chmod +x /var/www/bitci-bot/debug.sh
```

---

## 📋 Quick Reference

### Start/Stop Commands

```bash
# Start semua
/var/www/bitci-bot/start-production.sh

# Stop semua
/var/www/bitci-bot/stop-production.sh

# Restart semua
/var/www/bitci-bot/restart-production.sh

# Deploy update
/var/www/bitci-bot/deploy.sh
```

### PM2 Commands

```bash
pm2 status              # Lihat status
pm2 logs                # Lihat logs
pm2 logs --lines 100    # Lihat 100 baris terakhir
pm2 monit               # Monitor realtime
pm2 restart all         # Restart semua
pm2 restart bitci-backend  # Restart backend saja
pm2 stop all            # Stop semua
pm2 delete all          # Hapus semua
pm2 save                # Save konfigurasi
pm2 flush               # Clear logs
```

### Useful Commands

```bash
# Health check
/var/www/bitci-bot/health-check.sh

# Security check
/var/www/bitci-bot/security-check.sh

# Backup
/var/www/bitci-bot/backup.sh

# Debug
/var/www/bitci-bot/debug.sh

# View specific logs
tail -f /var/www/bitci-bot/logs/backend-out.log
tail -f /var/www/bitci-bot/logs/backend-error.log
```

### Default URLs

| Service | URL |
|---------|-----|
| Frontend | https://yourdomain.com |
| API | https://api.yourdomain.com |
| Health Check | https://api.yourdomain.com/health |
| WebSocket | wss://api.yourdomain.com |

### Default Accounts (setelah seed)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@bitci.com | admin123456 |
| User | user@bitci.com | user123456 |

---

## ✅ Deployment Checklist

```
[ ] Server sudah siap dengan requirements terpenuhi
[ ] Domain sudah pointing ke server IP
[ ] PostgreSQL terinstall dan running
[ ] Redis terinstall dan running
[ ] Nginx terinstall dan running
[ ] SSL certificate sudah di-generate
[ ] Environment variables sudah dikonfigurasi
[ ] Database migration sudah dijalankan
[ ] PM2 ecosystem.config.js sudah dibuat
[ ] Firewall (UFW) sudah dikonfigurasi
[ ] Fail2ban sudah dikonfigurasi
[ ] Backup script sudah dibuat
[ ] Cron jobs sudah disetup
[ ] Health check berjalan normal
[ ] Security check passed
```