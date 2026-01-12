#!/bin/bash

# Quick Start Script for Marketing Automation
# Run: bash quickstart.sh

echo "🚀 Marketing Automation Quick Start"
echo "===================================="
echo ""

# Check if in correct directory
if [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

cd backend

# Install dependencies
echo "📦 Installing required dependencies..."
npm install twilio firebase-admin axios --save

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Copy environment template:"
echo "   cp .env.example .env"
echo ""
echo "2. (Optional) Add your API credentials to .env:"
echo "   - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER"
echo "   - FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_* variables"
echo ""
echo "3. Test the services (works in mock mode without credentials):"
echo "   node scripts/testMarketingAutomation.js"
echo ""
echo "4. Start your server:"
echo "   npm start"
echo ""
echo "5. Access the workflow builder:"
echo "   http://localhost:5173/admin/automation"
echo ""
echo "📖 For detailed setup instructions, see:"
echo "   - MARKETING_AUTOMATION_SETUP.md"
echo "   - IMPLEMENTATION_SUMMARY.md"
echo ""
echo "✨ All done! Happy automating! 🤖"
