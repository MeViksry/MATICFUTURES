# 📚 BITCI FUTURES BOT - Dokumentasi Lengkap

## Daftar Isi

1. [Persyaratan Sistem](#1-persyaratan-sistem)
2. [Struktur Proyek](#2-struktur-proyek)
3. [Instalasi & Setup](#3-instalasi--setup)
4. [Konfigurasi Environment](#4-konfigurasi-environment)
5. [Menjalankan Development](#5-menjalankan-development)
6. [Menjalankan Production](#6-menjalankan-production)
7. [Database Migration](#7-database-migration)
8. [API Documentation](#8-api-documentation)
9. [Webhook TradingView](#9-webhook-tradingview)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Persyaratan Sistem

### Software yang Diperlukan

| Software | Versi Minimum | Keterangan |
|----------|---------------|------------|
| Node.js | 18.x atau 20.x | Runtime JavaScript |
| npm | 9.x+ | Package manager |
| PostgreSQL | 14+ | Database utama |
| Redis | 7+ | Queue & caching |
| Docker | 24+ | (Opsional) Containerization |
| Git | 2.x+ | Version control |

### Hardware Minimum (Production)

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 Core | 4 Core |
| RAM | 4 GB | 8 GB |
| Storage | 20 GB SSD | 50 GB SSD |
| Bandwidth | 100 Mbps | 1 Gbps |

---

## 2. Struktur Proyek

```
bitci-futures-bot/
│
├── frontend/                    # Nuxt.js Frontend
│   ├── assets/
│   │   └── css/
│   │       └── main.css        # Global styles
│   ├── components/
│   │   ├── icons/              # Icon components
│   │   ├── DashboardStatCard.vue
│   │   ├── Modal.vue
│   │   ├── ToastContainer.vue
│   │   └── TradingChart.vue
│   ├── composables/
│   │   ├── useApi.ts           # API helper
│   │   ├── useExchangeWebSocket.ts
│   │   ├── useToast.ts
│   │   └── useWebSocket.ts
│   ├── layouts/
│   │   ├── auth.vue            # Auth layout
│   │   └── default.vue         # Main layout
│   ├── middleware/
│   │   ├── admin.ts
│   │   ├── auth.ts
│   │   └── guest.ts
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── forgot-password.vue
│   │   │   ├── login.vue
│   │   │   ├── register.vue
│   │   │   └── verify-email.vue
│   │   ├── dashboard/
│   │   │   ├── api-keys.vue
│   │   │   ├── bot.vue
│   │   │   ├── index.vue
│   │   │   └── portfolio.vue
│   │   └── index.vue           # Landing page
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── bot.ts
│   │   ├── exchange.ts
│   │   └── portfolio.ts
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── nuxt.config.ts
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                     # Node.js Backend
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── env.ts
│   │   │   └── redis.ts
│   │   ├── controllers/
│   │   │   ├── admin.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── bot.controller.ts
│   │   │   ├── exchange.controller.ts
│   │   │   ├── portfolio.controller.ts
│   │   │   └── webhook.controller.ts
│   │   ├── exchange/
│   │   │   ├── base.ts
│   │   │   ├── binance.ts
│   │   │   ├── bitget.ts
│   │   │   ├── factory.ts
│   │   │   └── okx.ts
│   │   ├── middlewares/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── validate.ts
│   │   ├── routes/
│   │   │   ├── admin.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── bot.routes.ts
│   │   │   ├── exchange.routes.ts
│   │   │   ├── portfolio.routes.ts
│   │   │   └── webhook.routes.ts
│   │   ├── services/
│   │   │   ├── admin.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── bot.service.ts
│   │   │   ├── exchange.service.ts
│   │   │   ├── portfolio.service.ts
│   │   │   └── webhook.service.ts
│   │   ├── utils/
│   │   │   ├── apiResponse.ts
│   │   │   ├── email.ts
│   │   │   ├── encryption.ts
│   │   │   ├── jwt.ts
│   │   │   └── logger.ts
│   │   ├── validators/
│   │   │   ├── admin.validator.ts
│   │   │   ├── auth.validator.ts
│   │   │   ├── bot.validator.ts
│   │   │   └── exchange.validator.ts
│   │   ├── workers/
│   │   │   ├── index.ts
│   │   │   ├── metricsWorker.ts
│   │   │   ├── portfolioWorker.ts
│   │   │   └── webhookWorker.ts
│   │   ├── ws/
│   │   │   └── socketServer.ts
│   │   └── app.ts              # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── Dockerfile.worker
├── ecosystem.config.js         # PM2 config
├── nginx.conf
└── README.md
```

---

## 3. Instalasi & Setup

### 3.1 Clone Repository

```bash
# Clone atau buat folder proyek
mkdir bitci-futures-bot
cd bitci-futures-bot

# Buat struktur folder
mkdir -p frontend backend
```

### 3.2 Setup Backend

```bash
cd backend

# Inisialisasi package.json
npm init -y

# Install dependencies
npm install express cors helmet morgan jsonwebtoken bcryptjs \
  @prisma/client ioredis bullmq crypto-js dotenv nodemailer \
  socket.io uuid winston zod ccxt axios express-rate-limit

# Install dev dependencies
npm install -D typescript ts-node-dev @types/node @types/express \
  @types/cors @types/morgan @types/jsonwebtoken @types/bcryptjs \
  @types/crypto-js @types/nodemailer @types/uuid prisma

# Inisialisasi TypeScript
npx tsc --init

# Inisialisasi Prisma
npx prisma init
```

### 3.3 Setup Frontend

```bash
cd ../frontend

# Buat proyek Nuxt
npx nuxi@latest init .

# Install dependencies tambahan
npm install @pinia/nuxt pinia @vueuse/core @vueuse/nuxt \
  lightweight-charts chart.js vue-chartjs socket.io-client

# Install dev dependencies
npm install -D @nuxtjs/tailwindcss @nuxtjs/color-mode \
  @tailwindcss/forms @tailwindcss/typography
```

### 3.4 Setup Database (PostgreSQL)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Buat database
sudo -u postgres psql
```

```sql
-- Di dalam psql
CREATE DATABASE bitci_futures;
CREATE USER bitci_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bitci_futures TO bitci_user;
\q
```

### 3.5 Setup Redis

```bash
# Ubuntu/Debian
sudo apt install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Set password (opsional tapi recommended)
sudo nano /etc/redis/redis.conf
# Cari dan ubah: requirepass your_redis_password

# Restart Redis
sudo systemctl restart redis-server
```

---

## 4. Konfigurasi Environment

### 4.1 Backend Environment (.env)

Buat file `backend/.env`:

```env
# ============================================
# BITCI FUTURES BOT - Backend Configuration
# ============================================

# Application
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://bitci_user:your_password@localhost:5432/bitci_futures?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT Configuration
# Generate dengan: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_jwt_secret_key_min_64_characters_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
JWT_REFRESH_SECRET=your_refresh_secret_key_min_64_characters_xxxxxxxxxxxxxxxxxxxxxxx
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption Key (HARUS 32 karakter)
# Generate dengan: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
ENCRYPTION_KEY=your32characterencryptionkey!!

# Email SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
SMTP_FROM="BITCI Bot <noreply@bitci.com>"

# Frontend URL (untuk CORS dan email links)
FRONTEND_URL=http://localhost:3000
```

### 4.2 Frontend Environment (.env)

Buat file `frontend/.env`:

```env
# ============================================
# BITCI FUTURES BOT - Frontend Configuration
# ============================================

# API Configuration
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001
NUXT_PUBLIC_WS_URL=ws://localhost:3001

# Exchange WebSocket URLs (public)
NUXT_PUBLIC_BINANCE_WS_URL=wss://fstream.binance.com/ws
NUXT_PUBLIC_OKX_WS_URL=wss://ws.okx.com:8443/ws/v5/public
NUXT_PUBLIC_BITGET_WS_URL=wss://ws.bitget.com/mix/v1/stream
```

### 4.3 Generate Secret Keys

```bash
# Generate JWT Secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate Refresh Secret
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate Encryption Key (32 characters)
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(16).toString('hex'))"
```

### 4.4 Setup Gmail App Password

1. Buka Google Account Settings
2. Security → 2-Step Verification (aktifkan jika belum)
3. App passwords → Generate new
4. Pilih "Mail" dan device
5. Copy password yang digenerate ke `SMTP_PASS`

---

## 5. Menjalankan Development

### 5.1 Menjalankan Database Migration

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Jalankan migration
npx prisma migrate dev --name init

# (Opsional) Buka Prisma Studio untuk melihat data
npx prisma studio
```

### 5.2 Menjalankan Backend

```bash
cd backend

# Development mode dengan hot reload
npm run dev

# Output yang diharapkan:
# ✅ Database connected
# ✅ Redis connected
# ✅ WebSocket initialized
# 🚀 Server running on port 3001
```

### 5.3 Menjalankan Worker

```bash
cd backend

# Di terminal terpisah
npm run worker

# Output yang diharapkan:
# ✅ Worker: Database connected
# ✅ Worker: Redis connected
# ✅ Webhook Worker started
# ✅ Portfolio Worker started
# ✅ Metrics Worker started
# 🚀 All workers running
```

### 5.4 Menjalankan Frontend

```bash
cd frontend

# Development mode
npm run dev

# Output yang diharapkan:
# Nuxt 3.x.x with Nitro 2.x.x
# Local:    http://localhost:3000/
# Network:  http://192.168.x.x:3000/
```

### 5.5 Script Development Lengkap

Buat file `start-dev.sh` di root folder:

```bash
#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting BITCI Futures Bot Development Environment${NC}"
echo "=================================================="

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo -e "${YELLOW}Starting PostgreSQL...${NC}"
    sudo systemctl start postgresql
fi

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo -e "${YELLOW}Starting Redis...${NC}"
    sudo systemctl start redis-server
fi

# Start Backend
echo -e "${GREEN}Starting Backend...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start Worker
echo -e "${GREEN}Starting Worker...${NC}"
npm run worker &
WORKER_PID=$!

# Start Frontend
echo -e "${GREEN}Starting Frontend...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}All services started!${NC}"
echo "=================================================="
echo -e "Frontend:  ${YELLOW}http://localhost:3000${NC}"
echo -e "Backend:   ${YELLOW}http://localhost:3001${NC}"
echo -e "API Docs:  ${YELLOW}http://localhost:3001/health${NC}"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $WORKER_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
```

```bash
# Beri permission dan jalankan
chmod +x start-dev.sh
./start-dev.sh
```

---

## 6. Menjalankan Production

### 6.1 Menggunakan Docker (Recommended)

#### Build dan Jalankan dengan Docker Compose

```bash
# Clone/siapkan semua file

# Buat file .env untuk docker
cp .env.example .env
nano .env  # Edit sesuai kebutuhan

# Build images
docker-compose build

# Jalankan semua services
docker-compose up -d

# Lihat logs
docker-compose logs -f

# Lihat status
docker-compose ps
```

#### Docker Commands Berguna

```bash
# Stop semua services
docker-compose down

# Restart specific service
docker-compose restart backend

# Scale workers
docker-compose up -d --scale worker=4

# Update dan rebuild
docker-compose pull
docker-compose up -d --build

# Masuk ke container
docker exec -it bitci_backend sh

# Lihat logs specific service
docker-compose logs -f backend
docker-compose logs -f worker

# Database migration di Docker
docker exec -it bitci_backend npx prisma migrate deploy
```

### 6.2 Menggunakan PM2 (Tanpa Docker)

#### Install PM2

```bash
npm install -g pm2
```

#### Build Applications

```bash
# Build Backend
cd backend
npm run build

# Build Frontend
cd ../frontend
npm run build
```

#### Jalankan dengan PM2

```bash
# Dari root folder
pm2 start ecosystem.config.js

# Atau jalankan individual
pm2 start ecosystem.config.js --only bitci-backend
pm2 start ecosystem.config.js --only bitci-worker
pm2 start ecosystem.config.js --only bitci-frontend

# Lihat status
pm2 status

# Lihat logs
pm2 logs

# Monitor
pm2 monit

# Restart all
pm2 restart all

# Stop all
pm2 stop all

# Auto-start on boot
pm2 startup
pm2 save
```

### 6.3 Setup Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install nginx

# Copy konfigurasi
sudo cp nginx.conf /etc/nginx/nginx.conf

# Test konfigurasi
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

#### Nginx Configuration dengan SSL

```nginx
# /etc/nginx/sites-available/bitci
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }
}
```

#### Setup SSL dengan Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate SSL Certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (sudah otomatis, tapi bisa test)
sudo certbot renew --dry-run
```

---

## 7. Database Migration

### 7.1 Prisma Commands

```bash
cd backend

# Development - Create migration
npx prisma migrate dev --name migration_name

# Production - Apply migrations
npx prisma migrate deploy

# Reset database (HATI-HATI: menghapus semua data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Buka Prisma Studio (GUI)
npx prisma studio

# Format schema
npx prisma format

# Validate schema
npx prisma validate
```

### 7.2 Seed Database

Buat file `backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123456', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bitci.com' },
    update: {},
    create: {
      email: 'admin@bitci.com',
      password: adminPassword,
      fullName: 'Admin BITCI',
      role: 'SUPER_ADMIN',
      isActive: true,
      isEmailVerified: true,
      subscription: {
        create: {
          plan: 'YEARLY',
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      },
      portfolio: {
        create: {}
      },
      botSettings: {
        create: {}
      }
    }
  })

  console.log('Admin created:', admin.email)

  // Create Test User
  const userPassword = await bcrypt.hash('user123456', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'user@bitci.com' },
    update: {},
    create: {
      email: 'user@bitci.com',
      password: userPassword,
      fullName: 'Test User',
      role: 'USER',
      isActive: true,
      isEmailVerified: true,
      subscription: {
        create: {
          plan: 'MONTHLY',
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      portfolio: {
        create: {
          totalBalance: 10000,
          availableBalance: 10000
        }
      },
      botSettings: {
        create: {
          maxPositions: 5,
          defaultLeverage: 10,
          maxLeverage: 50,
          riskPerTrade: 2,
          stopLossPercent: 5,
          takeProfitPercent: 10
        }
      }
    }
  })

  console.log('Test user created:', user.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Update `backend/package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Jalankan seed:

```bash
npx prisma db seed
```

---

## 8. API Documentation

### 8.1 Authentication

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "minimum8chars",
  "fullName": "John Doe",
  "phone": "+6281234567890",
  "address": "Jakarta, Indonesia",
  "plan": "monthly"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "isActive": false,
      "isEmailVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Registration successful. Please verify your email."
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "minimum8chars"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "isActive": true,
      "subscription": {
        "plan": "MONTHLY",
        "status": "ACTIVE"
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}
```

#### Verify Email

```http
POST /api/auth/verify-email
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "code": "123456"
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 8.2 Exchange API Keys

#### Add API Key

```http
POST /api/exchange/api-keys
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "exchange": "binance",
  "apiKey": "your_api_key",
  "secretKey": "your_secret_key",
  "passphrase": "your_passphrase"  // Required for OKX
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "exchange": "BINANCE",
    "apiKey": "abcd****wxyz",
    "isActive": true,
    "isValid": true,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "API key added successfully"
}
```

#### Get API Keys

```http
GET /api/exchange/api-keys
Authorization: Bearer {accessToken}
```

#### Validate API Key

```http
POST /api/exchange/api-keys/{id}/validate
Authorization: Bearer {accessToken}
```

### 8.3 Trading Operations

#### Get Balance

```http
GET /api/exchange/balance
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBalance": 10000.50,
    "availableBalance": 8500.25,
    "unrealizedPnl": 150.75,
    "equity": 10151.25,
    "marginUsed": 1500.25,
    "marginAvailable": 8500.25
  }
}
```

#### Get Positions

```http
GET /api/exchange/positions
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "symbol": "BTCUSDT",
      "side": "long",
      "size": 0.1,
      "entryPrice": 45000,
      "markPrice": 46000,
      "leverage": 10,
      "unrealizedPnl": 100,
      "unrealizedPnlPercent": 2.22,
      "liquidationPrice": 41000,
      "margin": 450
    }
  ]
}
```

#### Create Order

```http
POST /api/exchange/order
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "symbol": "BTCUSDT",
  "side": "buy",
  "type": "market",
  "quantity": 0.01,
  "leverage": 10,
  "stopLoss": 44000,
  "takeProfit": 48000
}
```

#### Close Position

```http
POST /api/exchange/close-position
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "symbol": "BTCUSDT"
}
```

### 8.4 Bot Settings

#### Get Bot Settings

```http
GET /api/bot/settings
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "isEnabled": true,
    "maxPositions": 5,
    "defaultLeverage": 10,
    "maxLeverage": 50,
    "riskPerTrade": 2,
    "stopLossPercent": 5,
    "takeProfitPercent": 10,
    "trailingStop": false,
    "allowedSymbols": ["BTCUSDT", "ETHUSDT"],
    "blacklistedSymbols": []
  }
}
```

#### Update Bot Settings

```http
PATCH /api/bot/settings
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "maxPositions": 10,
  "defaultLeverage": 20,
  "stopLossPercent": 3,
  "takeProfitPercent": 15
}
```

#### Toggle Bot

```http
POST /api/bot/toggle
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "enabled": true
}
```

### 8.5 Portfolio

#### Get Portfolio

```http
GET /api/portfolio
Authorization: Bearer {accessToken}
```

#### Get Trade History

```http
GET /api/portfolio/history?page=1&limit=20
Authorization: Bearer {accessToken}
```

#### Get Performance Metrics

```http
GET /api/portfolio/metrics
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPnl": 1500.50,
    "totalPnlPercent": 15.05,
    "totalTrades": 50,
    "profitableTrades": 35,
    "losingTrades": 15,
    "winRate": 70,
    "profitFactor": 2.5,
    "maxDrawdown": 500,
    "maxDrawdownPercent": 5,
    "averageWin": 100,
    "averageLoss": 50,
    "largestWin": 500,
    "largestLoss": -200
  }
}
```

### 8.6 Admin Endpoints

#### Get All Users

```http
GET /api/admin/users?page=1&limit=20&status=active
Authorization: Bearer {adminAccessToken}
```

#### Activate User

```http
PATCH /api/admin/users/{userId}/activate
Authorization: Bearer {adminAccessToken}
```

#### Dashboard Stats

```http
GET /api/admin/stats
Authorization: Bearer {adminAccessToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1500,
    "activeUsers": 1200,
    "inactiveUsers": 300,
    "totalApiKeys": 1800,
    "validApiKeys": 1650,
    "activeBots": 800,
    "totalTrades": 50000,
    "totalVolume": 5000000,
    "totalPnl": 150000,
    "recentSignups": 50
  }
}
```

---

## 9. Webhook TradingView

### 9.1 Mendapatkan Webhook URL

1. Login ke dashboard
2. Pergi ke Bot Settings
3. Copy Webhook URL yang tergenerate

Format URL:
```
https://yourdomain.com/api/webhook/{userId}/{token}
```

### 9.2 Format Alert Message TradingView

#### Long Position (Buy)

```json
{
  "action": "buy",
  "symbol": "BTCUSDT",
  "side": "long",
  "leverage": 10,
  "quantity": 0.01,
  "stopLoss": 44000,
  "takeProfit": 48000
}
```

#### Short Position (Sell)

```json
{
  "action": "sell",
  "symbol": "BTCUSDT",
  "side": "short",
  "leverage": 10,
  "quantity": 0.01,
  "stopLoss": 48000,
  "takeProfit": 44000
}
```

#### Close Position

```json
{
  "action": "close",
  "symbol": "BTCUSDT"
}
```

#### Dynamic Values dari TradingView

```json
{
  "action": "{{strategy.order.action}}",
  "symbol": "{{ticker}}",
  "side": "{{strategy.market_position}}",
  "price": {{close}},
  "quantity": {{strategy.order.contracts}}
}
```

### 9.3 Setup di TradingView

1. Buka chart di TradingView
2. Tambahkan indicator/strategy
3. Klik "Alert" (jam alarm)
4. Settings:
   - **Condition**: Pilih indicator/strategy
   - **Actions**: Check "Webhook URL"
   - **Webhook URL**: Paste URL dari dashboard
   - **Message**: JSON format sesuai di atas
5. Create Alert

### 9.4 Testing Webhook

```bash
# Test dengan curl
curl -X POST https://yourdomain.com/api/webhook/{userId}/{token} \
  -H "Content-Type: application/json" \
  -d '{
    "action": "buy",
    "symbol": "BTCUSDT",
    "side": "long",
    "leverage": 10,
    "quantity": 0.001
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Webhook received",
  "responseTime": "45ms"
}
```

---

## 10. Troubleshooting

### 10.1 Common Errors

#### Database Connection Error

```
Error: P1001: Can't reach database server at `localhost:5432`
```

**Solusi:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql

# Check connection
psql -h localhost -U bitci_user -d bitci_futures
```

#### Redis Connection Error

```
Error: Redis connection refused
```

**Solusi:**
```bash
# Check Redis status
sudo systemctl status redis-server

# Start if not running
sudo systemctl start redis-server

# Test connection
redis-cli ping
# Should return: PONG

# If using password
redis-cli -a your_password ping
```

#### JWT Token Expired

```json
{
  "success": false,
  "message": "Token expired"
}
```

**Solusi:**
- Gunakan refresh token untuk mendapatkan access token baru
- Implement auto-refresh di frontend

#### API Key Invalid

```json
{
  "success": false,
  "message": "No valid API key found"
}
```

**Solusi:**
1. Check API key di exchange (aktif?)
2. Validate ulang API key di dashboard
3. Pastikan permission API key benar:
   - ✅ Enable Futures
   - ✅ Enable Trading
   - ❌ Disable Withdrawal

#### Exchange API Error

```
Error: Binance API error: -2015 Invalid API-key
```

**Solusi:**
1. Regenerate API key di exchange
2. Pastikan IP whitelist (jika ada)
3. Check API key permission

### 10.2 Performance Issues

#### Slow Webhook Response

**Penyebab:**
- Database query lambat
- Redis tidak optimal
- Network latency

**Solusi:**
```bash
# Check Redis performance
redis-cli --latency

# Monitor database queries
# Enable slow query log di PostgreSQL

# Scale workers
pm2 scale bitci-worker 4
```

#### High Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart dengan memory limit
pm2 restart bitci-backend --max-memory-restart 1G
```

### 10.3 Debug Mode

#### Enable Debug Logging

```env
# backend/.env
NODE_ENV=development
DEBUG=true
```

#### View Detailed Logs

```bash
# PM2 logs
pm2 logs bitci-backend --lines 100

# Docker logs
docker-compose logs -f --tail=100 backend

# Real-time monitoring
pm2 monit
```

### 10.4 Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Expected response
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}

# Database connection test
cd backend && npx prisma db pull

# Redis connection test
redis-cli ping
```

### 10.5 Reset & Recovery

#### Reset Database (Development Only)

```bash
cd backend

# Reset and reseed
npx prisma migrate reset

# This will:
# 1. Drop database
# 2. Create database
# 3. Apply all migrations
# 4. Run seed
```

#### Backup Database

```bash
# Backup
pg_dump -U bitci_user -d bitci_futures > backup_$(date +%Y%m%d).sql

# Restore
psql -U bitci_user -d bitci_futures < backup_20240115.sql
```

#### Clear Redis Cache

```bash
redis-cli FLUSHALL
# atau specific
redis-cli DEL "webhook:queue"
redis-cli DEL "bot:active_users"
```

---

## 📋 Quick Reference

### Development Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run worker       # Start workers

# Frontend
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run generate     # Generate static site

# Database
npx prisma migrate dev    # Create migration
npx prisma migrate deploy # Apply migrations
npx prisma studio         # Open GUI
npx prisma db seed        # Run seeder

# Docker
docker-compose up -d      # Start all services
docker-compose down       # Stop all services
docker-compose logs -f    # View logs

# PM2
pm2 start ecosystem.config.js
pm2 restart all
pm2 stop all
pm2 logs
pm2 monit
```

### Default Credentials (Development)

| User | Email | Password |
|------|-------|----------|
| Admin | admin@bitci.com | admin123456 |
| User | user@bitci.com | user123456 |

### Ports

| Service | Port |
|---------|------|
| Frontend | 3000 |
| Backend API | 3001 |
| PostgreSQL | 5432 |
| Redis | 6379 |

---

## 🎉 Selesai!

Dokumentasi ini mencakup semua yang diperlukan untuk menjalankan BITCI Futures Bot. Jika ada pertanyaan atau masalah, silakan:

1. Check troubleshooting section
2. Review logs untuk error details
3. Pastikan semua environment variables sudah benar
4. Verifikasi koneksi database dan Redis

**Happy Trading! 🚀📈**