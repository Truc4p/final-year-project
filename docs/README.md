# Wrencos - Full-Stack E-Commerce Platform with Live Streaming

## 🚀 Project Overview

Wrencos is a comprehensive e-commerce platform for beauty and skincare products with advanced features including live streaming, AI-powered chat assistance, email marketing, and complete business management tools.

### Key Features

- **E-Commerce**: Complete product catalog, shopping cart, and order management
- **Live Streaming**: Real-time video streaming with product pinning and live chat
- **AI Chat Assistant**: Gemini AI-powered product recommendations and customer support
- **Email Marketing**: Campaign management, templates, and subscriber segmentation
- **Analytics Dashboard**: Sales, revenue, and customer insights
- **Finance Management**: Cash flow tracking and expense management
- **HR Management**: Employee records and document management
- **Multi-Platform**: Web admin panel, web customer interface, and mobile app

## 📁 Project Structure

```
wrencos/
├── backend/              # Node.js/Express REST API
├── frontend/             # Vue.js Admin & Customer Web App
└── mobile-app-customer/  # React Native Mobile App
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: WebSocket (ws library)
- **AI**: Google Gemini AI
- **Email**: Nodemailer
- **File Upload**: Multer
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Routing**: Vue Router
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + vue-chartjs
- **HTTP Client**: Axios
- **i18n**: Vue I18n

### Mobile App
- **Framework**: React Native
- **Build**: Expo
- **Navigation**: React Navigation
- **State**: React Context API
- **HTTP Client**: Axios

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Google Gemini API key
- Gmail account (for email service)

### Environment Variables

Create `.env` file in the `backend` directory:

```env
# Database
MONGODB_URI=mongodb+srv://mongo-api:7TZYsdhwiXhiKRp9@cluster0.18pi3.mongodb.net/Wrencos?retryWrites=true&w=majority

# JWT
JWT_SECRET=secret

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email Service
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
COMPANY_NAME=Wrencos

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173

# Server
PORT=3000
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Server runs on: http://localhost:3000
API Documentation: http://localhost:3000/api-docs

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

### Mobile App Setup

```bash
cd mobile-app-customer
npm install
npm start
```

## 🔑 Default Admin Credentials

To create an admin account, use the admin key: `secret`

```json
{
  "username": "admin",
  "password": "yourpassword",
  "role": "admin",
  "adminKey": "secret"
}
```

## 📚 Documentation

- [Backend API Documentation](./docs/backend/README.md)
- [Frontend Documentation](./docs/frontend/README.md)
- [Mobile App Documentation](./docs/mobile/README.md)
- [Database Schema](./docs/database/SCHEMA.md)
- [WebSocket Protocol](./docs/websocket/PROTOCOL.md)
- [Deployment Guide](./docs/deployment/GUIDE.md)

## 🎯 Core Modules

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin/Customer)
- Secure password hashing with bcrypt

### 2. E-Commerce
- Product catalog with categories
- Shopping cart management
- Order processing (COD & Online Payment)
- Inventory tracking

### 3. Live Streaming
- Real-time video streaming
- Live chat with WebSocket
- Product pinning during streams
- Stream analytics (viewers, likes)
- Recording and playback

### 4. AI Chat Assistant
- Gemini AI-powered responses
- Product recommendations based on skin type/concerns
- FAQ management
- Conversation history
- Staff escalation for complex queries

### 5. Email Marketing
- Campaign management
- Email templates
- Subscriber segmentation
- Analytics tracking (opens, clicks, unsubscribes)
- Bulk email sending

### 6. Analytics & Reporting
- Sales analytics
- Revenue tracking
- Customer insights
- Campaign performance
- Real-time dashboards

### 7. Finance Management
- Cash flow tracking
- Expense management
- Revenue vs. expense reports
- Business expense categorization

### 8. HR Management
- Employee records
- Document management
- File uploads for HR documents

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Products
- `GET /products` - List all products
- `GET /products/:id` - Get product details
- `POST /products` - Create product (Admin)
- `PUT /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Delete product (Admin)

### Orders
- `GET /orders` - List orders
- `POST /orders` - Create order
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Cancel order

### Live Streaming
- `GET /livestreams` - List streams
- `POST /livestreams` - Create stream (Admin)
- `PUT /livestreams/:id/stop` - Stop stream
- `POST /livestreams/:id/pin-product` - Pin product

### Chat
- `GET /chat/faqs` - Get FAQs
- `POST /chat/ai` - AI chat
- `POST /chat/connect-staff` - Connect to staff
- `GET /chat/history/:sessionId` - Get conversation history

### Email Campaigns
- `GET /email-campaigns` - List campaigns
- `POST /email-campaigns` - Create campaign
- `POST /email-campaigns/:id/send` - Send campaign

For complete API documentation, visit: http://localhost:3000/api-docs

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Mobile Development
```bash
cd mobile-app-customer
npm start
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

### Mobile
```bash
cd mobile-app-customer
npm run build
```

## 🚢 Deployment

See [Deployment Guide](./docs/deployment/GUIDE.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is part of a Final Year Project (FYP).

## 👥 Authors

- Pham Thanh Truc

## 🙏 Acknowledgments

- Google Gemini AI for chat assistance
- MongoDB Atlas for database hosting
- All open-source libraries used in this project

## 📞 Support

For support, email your_email@example.com or create an issue in the repository.
