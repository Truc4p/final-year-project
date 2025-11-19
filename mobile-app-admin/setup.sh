#!/bin/bash

# Admin Livestream App - Quick Start Script
# This script helps you configure and start the admin mobile app

echo "🎥 WrenCos Admin Livestream - Quick Start"
echo "========================================"
echo ""

# Get local IP address
echo "📡 Detecting your local IP address..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
else
    # Windows (Git Bash)
    LOCAL_IP=$(ipconfig | grep "IPv4" | head -1 | awk '{print $NF}')
fi

echo "✅ Your local IP: $LOCAL_IP"
echo ""

# Update constants file
CONSTANTS_FILE="src/constants/index.js"

if [ -f "$CONSTANTS_FILE" ]; then
    echo "📝 Updating API configuration..."
    
    # Backup original file
    cp "$CONSTANTS_FILE" "${CONSTANTS_FILE}.backup"
    
    # Update IP addresses
    sed -i.tmp "s|http://[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}:3000|http://${LOCAL_IP}:3000|g" "$CONSTANTS_FILE"
    sed -i.tmp "s|ws://[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}:3000|ws://${LOCAL_IP}:3000|g" "$CONSTANTS_FILE"
    rm "${CONSTANTS_FILE}.tmp"
    
    echo "✅ Configuration updated!"
    echo "   API URL: http://${LOCAL_IP}:3000"
    echo "   WebSocket URL: ws://${LOCAL_IP}:3000"
else
    echo "❌ Error: Constants file not found!"
    echo "   Make sure you're in the mobile-app-admin directory"
    exit 1
fi

echo ""
echo "📦 Checking dependencies..."

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎯 Setup Complete!"
echo ""
echo "📱 Next steps:"
echo "1. Ensure backend is running: cd ../backend && npm start"
echo "2. Start this app: npm start"
echo "3. Scan QR code with Expo Go app"
echo "4. Login with admin credentials"
echo ""
echo "💡 Tip: Make sure your device and computer are on the same Wi-Fi network!"
echo ""
