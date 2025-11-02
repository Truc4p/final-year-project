#!/bin/bash

echo "🚀 Setting up Customer Shopping Mobile App..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm is installed"

# Check if expo-cli is installed
if ! command -v expo &> /dev/null; then
    echo "⚠️  Expo CLI is not installed globally"
    echo "Installing Expo CLI..."
    npm install -g expo-cli
fi

echo "✅ Expo CLI is installed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Get local IP address
echo ""
echo "🔍 Detecting your local IP address..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ipconfig getifaddr en0)
    if [ -z "$LOCAL_IP" ]; then
        LOCAL_IP=$(ipconfig getifaddr en1)
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
else
    # Windows (Git Bash)
    LOCAL_IP=$(ipconfig | grep -A 5 "Wireless LAN adapter Wi-Fi" | grep "IPv4 Address" | awk '{print $NF}')
fi

if [ -z "$LOCAL_IP" ]; then
    echo "⚠️  Could not detect IP address automatically"
    echo "Please manually update src/constants/index.js with your IP address"
else
    echo "✅ Your local IP address is: ${GREEN}${LOCAL_IP}${NC}"
    echo ""
    echo "📝 Please update src/constants/index.js:"
    echo "   export const API_BASE_URL = 'http://${LOCAL_IP}:3000/api';"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Setup complete! Next steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Update API_BASE_URL in src/constants/index.js"
if [ ! -z "$LOCAL_IP" ]; then
    echo "   Use: http://${LOCAL_IP}:3000/api"
fi
echo ""
echo "2. Start the backend server:"
echo "   ${YELLOW}cd ../backend && npm start${NC}"
echo ""
echo "3. Start the mobile app (in another terminal):"
echo "   ${YELLOW}npm start${NC}"
echo ""
echo "4. Scan QR code with Expo Go app on your device"
echo ""
echo "📖 For more details, see README.md and QUICKSTART.md"
echo ""
