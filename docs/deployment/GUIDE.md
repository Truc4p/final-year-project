# Deployment Guide

## Overview

This guide covers deploying the Wrencos platform to production, including backend, frontend, and mobile app.

## Prerequisites

- Node.js 14+ installed
- MongoDB Atlas account
- Domain name (for production)
- SSL certificate (for HTTPS/WSS)
- Cloud hosting account (AWS, DigitalOcean, Heroku, etc.)
- Gmail account for email service
- Google Gemini API key

## Backend Deployment

### Option 1: Heroku

#### 1. Prepare the Application

Add `Procfile` in backend directory:
```
web: node server.js
```

Update `package.json`:
```json
{
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": "16.x"
  }
}
```

#### 2. Deploy to Heroku

```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create wrencos-api

# Set environment variables
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_secret_key"
heroku config:set GEMINI_API_KEY="your_gemini_key"
heroku config:set GMAIL_USER="your_email"
heroku config:set GMAIL_APP_PASSWORD="your_app_password"
heroku config:set FRONTEND_URL="https://wrencos.com"
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

Your API will be available at: `https://wrencos-api.herokuapp.com`

### Option 2: DigitalOcean/AWS/VPS

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y
```

#### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/your-repo/wrencos.git
cd wrencos/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
# Add your environment variables

# Start with PM2
pm2 start server.js --name wrencos-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

#### 3. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/wrencos-api
```

Add configuration:
```nginx
server {
    listen 80;
    server_name api.wrencos.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/wrencos-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d api.wrencos.com

# Auto-renewal is set up automatically
# Test renewal:
sudo certbot renew --dry-run
```

Your API will be available at: `https://api.wrencos.com`

### Option 3: Docker Deployment

#### 1. Create Dockerfile

**File**: `backend/Dockerfile`

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - GMAIL_USER=${GMAIL_USER}
      - GMAIL_APP_PASSWORD=${GMAIL_APP_PASSWORD}
      - FRONTEND_URL=${FRONTEND_URL}
      - NODE_ENV=production
    restart: unless-stopped
```

#### 3. Deploy

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

#### 1. Prepare Build

Update `vite.config.js`:
```javascript
export default {
  build: {
    outDir: 'dist'
  }
}
```

Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### 2. Deploy to Vercel

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Or connect GitHub repo for automatic deployments
```

Set environment variables in Vercel dashboard:
- `VITE_API_URL=https://api.wrencos.com`
- `VITE_WS_URL=wss://api.wrencos.com`

Your frontend will be available at: `https://wrencos.vercel.app` or your custom domain.

### Option 2: Netlify

#### 1. Create `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Option 3: Self-Hosted (Nginx)

#### 1. Build Application

```bash
cd frontend
npm run build
```

#### 2. Configure Nginx

```nginx
server {
    listen 80;
    server_name wrencos.com www.wrencos.com;
    root /var/www/wrencos/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 256;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;
}
```

#### 3. Deploy Files

```bash
# Copy build files to server
scp -r dist/* user@server:/var/www/wrencos/dist/

# Or use rsync
rsync -avz dist/ user@server:/var/www/wrencos/dist/
```

#### 4. SSL Certificate

```bash
sudo certbot --nginx -d wrencos.com -d www.wrencos.com
```

## Mobile App Deployment

### iOS App Store

#### 1. Prerequisites

- Apple Developer Account ($99/year)
- Mac with Xcode installed
- App Store Connect access

#### 2. Build for iOS

```bash
cd mobile-app-customer

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS Build
eas build:configure

# Build for iOS
eas build --platform ios
```

#### 3. Submit to App Store

```bash
# Submit build
eas submit --platform ios
```

Follow App Store Connect guidelines:
- App name
- Description
- Screenshots
- Privacy policy
- App review information

### Android Play Store

#### 1. Prerequisites

- Google Play Developer Account ($25 one-time fee)
- Google Play Console access

#### 2. Build for Android

```bash
cd mobile-app-customer

# Build for Android
eas build --platform android

# Or build APK for testing
eas build --platform android --profile preview
```

#### 3. Submit to Play Store

```bash
# Submit build
eas submit --platform android
```

Follow Play Store guidelines:
- App details
- Content rating
- Pricing & distribution
- Store listing (screenshots, description)

## Database Setup

### MongoDB Atlas (Recommended)

#### 1. Create Cluster

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (Free M0 tier available)
3. Configure network access (whitelist IP or allow from anywhere for development)
4. Create database user with password

#### 2. Get Connection String

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Wrencos?retryWrites=true&w=majority
```

#### 3. Configure Application

Set `MONGODB_URI` environment variable to your connection string.

### Self-Hosted MongoDB

#### 1. Install MongoDB

```bash
# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### 2. Secure MongoDB

```bash
# Connect to MongoDB
mongosh

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "securepassword",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

# Create app user
use Wrencos
db.createUser({
  user: "wrencos",
  pwd: "securepassword",
  roles: [ { role: "readWrite", db: "Wrencos" } ]
})
```

#### 3. Enable Authentication

Edit `/etc/mongod.conf`:
```yaml
security:
  authorization: enabled
```

Restart MongoDB:
```bash
sudo systemctl restart mongod
```

Connection string:
```
mongodb://wrencos:securepassword@localhost:27017/Wrencos
```

## Email Service Setup

### Gmail SMTP

#### 1. Enable 2-Factor Authentication

1. Go to Google Account settings
2. Enable 2-factor authentication

#### 2. Generate App Password

1. Go to Security → App passwords
2. Generate password for "Mail"
3. Copy the 16-character password

#### 3. Configure Application

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### Alternative: SendGrid

For production, consider using SendGrid for better deliverability:

```bash
npm install @sendgrid/mail
```

Update `emailService.js` to use SendGrid API.

## Environment Variables

### Production Environment Variables

**Backend**:
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_strong_secret_key_min_32_chars
GEMINI_API_KEY=your_gemini_api_key
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
COMPANY_NAME=Wrencos
FRONTEND_URL=https://wrencos.com
```

**Frontend**:
```env
VITE_API_URL=https://api.wrencos.com
VITE_WS_URL=wss://api.wrencos.com
```

## Security Checklist

- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS/SSL on all domains
- [ ] Enable WSS (WebSocket Secure) for WebSocket
- [ ] Set secure CORS origins (not `*`)
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Validate all user inputs
- [ ] Sanitize database queries
- [ ] Keep dependencies updated
- [ ] Enable MongoDB authentication
- [ ] Restrict MongoDB network access
- [ ] Use secure password hashing (bcrypt)
- [ ] Implement CSRF protection
- [ ] Set security headers (helmet.js)
- [ ] Enable error logging but hide stack traces from users
- [ ] Regular security audits
- [ ] Backup database regularly

## Performance Optimization

### Backend

1. **Enable compression**:
```javascript
const compression = require('compression');
app.use(compression());
```

2. **Cache static assets**:
```javascript
app.use(express.static('uploads', { maxAge: '1d' }));
```

3. **Database indexing**: Ensure all frequently queried fields are indexed

4. **Connection pooling**: MongoDB driver handles this automatically

### Frontend

1. **Enable gzip in Nginx**
2. **Use CDN for static assets**
3. **Implement lazy loading**
4. **Optimize images**
5. **Code splitting** (Vite does this automatically)

## Monitoring & Logging

### Application Monitoring

**Option 1: PM2 Monitoring**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Option 2: Application Performance Monitoring (APM)**
- New Relic
- Datadog
- AppDynamics

### Error Tracking

**Sentry Integration**:
```bash
npm install @sentry/node
```

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.errorHandler());
```

### Log Management

**Winston for structured logging**:
```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## Backup Strategy

### Database Backups

**Automated MongoDB Atlas Backups**:
- Continuous cloud backup
- Point-in-time recovery
- Automatic snapshots

**Manual Backup**:
```bash
# Backup
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb+srv://..." /backup/20240201
```

### File Backups

```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/

# Schedule with cron
crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or cloud load balancer
2. **Multiple Backend Instances**: Run multiple server instances
3. **Shared Session Store**: Use Redis for session management
4. **WebSocket Scaling**: Use Redis pub/sub for WebSocket across instances

### Vertical Scaling

1. **Increase server resources** (RAM, CPU)
2. **Optimize database queries**
3. **Add database read replicas**

## CI/CD Pipeline

### GitHub Actions Example

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Run tests
        run: |
          cd backend
          npm test
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "wrencos-api"
          heroku_email: "your-email@example.com"
          appdir: "backend"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install and build
        run: |
          cd frontend
          npm install
          npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

## Rollback Plan

### Backend Rollback

**Heroku**:
```bash
# View releases
heroku releases

# Rollback to previous version
heroku rollback v123
```

**PM2**:
```bash
# Keep previous version
git checkout previous-tag
npm install
pm2 reload wrencos-api
```

### Frontend Rollback

**Vercel**: Use dashboard to rollback to previous deployment

**Self-hosted**:
```bash
# Keep previous build
mv dist dist-new
mv dist-previous dist
```

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test authentication flow
- [ ] Test key features (products, orders, live stream)
- [ ] Check WebSocket connections
- [ ] Verify email sending works
- [ ] Test mobile app connections
- [ ] Monitor error logs
- [ ] Check database connections
- [ ] Verify SSL certificates
- [ ] Test payment processing (if applicable)
- [ ] Run security scan
- [ ] Check application performance
- [ ] Set up monitoring alerts
- [ ] Document deployment process
- [ ] Update DNS if needed
- [ ] Notify team of deployment

## Support & Maintenance

### Regular Maintenance Tasks

- **Daily**: Monitor error logs, check server health
- **Weekly**: Review analytics, check disk space, review security logs
- **Monthly**: Update dependencies, database backups verification, security patches
- **Quarterly**: Security audit, performance review, cost optimization

### Troubleshooting

**Issue**: 502 Bad Gateway
- Check if backend server is running
- Check Nginx configuration
- Review application logs

**Issue**: Database connection timeout
- Check MongoDB Atlas network access
- Verify connection string
- Check database user permissions

**Issue**: WebSocket connection fails
- Verify Nginx WebSocket proxy configuration
- Check firewall rules
- Test with WSS in production

## Cost Estimation

### Free Tier (Development)

- Backend: Heroku Free or DigitalOcean $5/month
- Database: MongoDB Atlas Free (M0)
- Frontend: Vercel Free
- Total: ~$5/month

### Production (Small Scale)

- Backend: DigitalOcean Droplet $12/month
- Database: MongoDB Atlas M10 $57/month
- Frontend: Vercel Pro $20/month
- Domain: $12/year
- SSL: Free (Let's Encrypt)
- Total: ~$90/month

### Production (Medium Scale)

- Backend: DigitalOcean $24/month (multiple droplets + load balancer)
- Database: MongoDB Atlas M30 $200/month
- Frontend: Vercel Pro $20/month
- CDN: Cloudflare Free
- Monitoring: Datadog ~$15/month
- Total: ~$260/month

## Conclusion

This deployment guide covers multiple deployment scenarios. Choose the options that best fit your budget, technical expertise, and scalability requirements.

For production deployments, always prioritize security, monitoring, and backup strategies.
