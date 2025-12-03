# Dependencies to Install

## Backend Dependencies

Run this in your backend directory:

```bash
npm install imap mailparser nodemailer
```

### What Each Package Does

| Package | Purpose | Version |
|---------|---------|---------|
| `imap` | IMAP client for connecting to email servers | ^5.2.0 |
| `mailparser` | Parse email content and extract data | ^3.6.0 |
| `nodemailer` | Send and verify emails (optional, for testing) | ^6.9.0 |

## Optional Dependencies (Recommended)

For production use, also install:

```bash
npm install node-cron crypto
```

| Package | Purpose | When to Use |
|---------|---------|------------|
| `node-cron` | Schedule daily email syncs | For auto-sync feature |
| `crypto` | Encrypt passwords in database | For security |

## Full Installation Command

```bash
# Install all required packages
npm install imap mailparser nodemailer node-cron

# Verify installation
npm list imap mailparser nodemailer node-cron
```

## Verify Installation

After installation, verify in Node.js:

```javascript
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');

console.log('✅ All packages installed successfully!');
```

## If Installation Fails

### Common Issues

**Issue: `npm ERR! code ERESOLVE`**
```bash
# Try with legacy peer deps
npm install --legacy-peer-deps imap mailparser nodemailer
```

**Issue: `npm ERR! gyp ERR!`**
```bash
# Install build tools (macOS)
xcode-select --install

# Install build tools (Windows)
# Download Visual Studio Build Tools

# Install build tools (Linux)
sudo apt-get install build-essential python3
```

**Issue: `EACCES: permission denied`**
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

## Verify Packages Work

Create a test file `test-email.js`:

```javascript
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');

console.log('Testing email packages...');

// Test IMAP
try {
  const imap = new Imap({
    user: 'test@gmail.com',
    password: 'test',
    host: 'imap.gmail.com',
    port: 993,
    tls: true
  });
  console.log('✅ IMAP package loaded');
} catch (e) {
  console.log('❌ IMAP error:', e.message);
}

// Test mailparser
try {
  console.log('✅ Mailparser package loaded');
} catch (e) {
  console.log('❌ Mailparser error:', e.message);
}

// Test nodemailer
try {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'test', pass: 'test' }
  });
  console.log('✅ Nodemailer package loaded');
} catch (e) {
  console.log('❌ Nodemailer error:', e.message);
}

console.log('\nAll packages ready!');
```

Run with:
```bash
node test-email.js
```

## Package Versions

Recommended versions for compatibility:

```json
{
  "dependencies": {
    "imap": "^5.2.0",
    "mailparser": "^3.6.0",
    "nodemailer": "^6.9.0",
    "node-cron": "^3.0.2"
  }
}
```

## Frontend Dependencies

No additional frontend dependencies needed! The Vue.js frontend uses:
- ✅ Vue 3 (already installed)
- ✅ Tailwind CSS (already installed)
- ✅ Fetch API (built-in)

## Docker Setup (Optional)

If using Docker, add to `Dockerfile`:

```dockerfile
# Install system dependencies for node modules
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Install npm packages
RUN npm install imap mailparser nodemailer node-cron
```

## Troubleshooting Installation

### macOS
```bash
# If you get permission errors
sudo chown -R $(whoami) /usr/local/lib/node_modules

# If you get build errors
brew install python3
```

### Windows
```bash
# Install Visual Studio Build Tools
# https://visualstudio.microsoft.com/visual-cpp-build-tools/

# Then retry
npm install imap mailparser nodemailer
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y build-essential python3 nodejs npm

npm install imap mailparser nodemailer
```

## Verify Everything is Ready

Run this command to check all dependencies:

```bash
npm list imap mailparser nodemailer
```

You should see:
```
your-project@1.0.0
├── imap@5.2.0
├── mailparser@3.6.0
└── nodemailer@6.9.0
```

## Next Steps

After installation:
1. ✅ Copy backend files to your project
2. ✅ Register routes in Express
3. ✅ Update models
4. ✅ Test email connection
5. ✅ Start syncing transactions!

---

**All set!** You're ready to use email bank notifications. 🎉

