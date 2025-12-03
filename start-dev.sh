#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Bitici Bot Development Environment${NC}"
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