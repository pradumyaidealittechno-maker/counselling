#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔════════════════════════════════════════╗"
echo "║   Intelligens - Fix & Start            ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}\n"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo -e "${YELLOW}Please run this script from the project root directory${NC}"
    exit 1
fi

# Step 1: Check Node.js
echo -e "${BLUE}1️⃣ Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js ${NODE_VERSION} installed${NC}\n"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Step 2: Install dependencies
echo -e "${BLUE}2️⃣ Installing dependencies...${NC}"

echo -e "${CYAN}   Installing frontend dependencies...${NC}"
npm install

echo -e "${CYAN}   Installing backend dependencies...${NC}"
cd server
npm install
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}\n"

# Step 3: Check environment files
echo -e "${BLUE}3️⃣ Checking environment files...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Creating frontend .env file...${NC}"
    cat > .env << 'EOF'
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001
VITE_RETELL_AGENT_ID=agent_c6b7c2990a39bbf7ac147f18d4
EOF
    echo -e "${GREEN}✅ Frontend .env created${NC}"
else
    echo -e "${GREEN}✅ Frontend .env exists${NC}"
fi

if [ ! -f "server/.env" ]; then
    echo -e "${RED}❌ Backend .env file not found${NC}"
    echo -e "${YELLOW}Please create server/.env from server/.env.example${NC}"
    echo -e "${YELLOW}And configure your MongoDB URI${NC}\n"
    exit 1
else
    echo -e "${GREEN}✅ Backend .env exists${NC}"
fi

echo ""

# Step 4: Test MongoDB connection
echo -e "${BLUE}4️⃣ Testing MongoDB connection...${NC}"
cd server

# Create a quick test script
cat > test-mongo-quick.js << 'EOF'
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  });
EOF

if node test-mongo-quick.js 2>/dev/null; then
    echo -e "${GREEN}✅ MongoDB connection successful${NC}\n"
    rm test-mongo-quick.js
else
    echo -e "${RED}❌ MongoDB connection failed${NC}"
    echo -e "${YELLOW}Please check your MONGODB_URI in server/.env${NC}"
    echo -e "${YELLOW}See START_HERE.md for troubleshooting${NC}\n"
    rm test-mongo-quick.js
    exit 1
fi

cd ..

# Step 5: Start servers
echo -e "${BLUE}5️⃣ Starting servers...${NC}\n"

echo -e "${CYAN}Starting backend with auto-setup...${NC}"
echo -e "${YELLOW}This will create an admin user if none exists${NC}\n"

cd server
npm run setup &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 5

cd ..

echo -e "\n${CYAN}Starting frontend...${NC}\n"
npm run dev &
FRONTEND_PID=$!

# Wait for user to stop
echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Servers Started Successfully!        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"

echo -e "${CYAN}📝 Default Login Credentials:${NC}"
echo -e "   Email: ${GREEN}admin@intelligens.app${NC}"
echo -e "   Password: ${GREEN}Admin123!${NC}\n"

echo -e "${CYAN}🌐 Access Points:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:5175${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:3001${NC}\n"

echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}\n"

# Wait for Ctrl+C
trap "echo -e '\n${YELLOW}Stopping servers...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

wait
