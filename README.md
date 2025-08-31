# 🌍 PayStreet - Cross-Border Remittance Portal

A modern, full-stack cross-border remittance application built with React, Node.js, and PostgreSQL. Features live FX rates, KYC verification, and professional receipt generation.

## ✨ **Features**

### 🎯 **Core Features**

- **User Authentication & Onboarding** - JWT-based auth with role management
- **Beneficiary Management** - Add, edit, delete international beneficiaries
- **Live FX Rates Integration** - Real-time currency conversion via ExchangeRate API
- **Money Transfer Workflow** - Professional fee calculation and transaction processing
- **Transaction Dashboard** - Complete history with filtering and search
- **Admin Panel** - User management and transaction monitoring

### 🚀 **Bonus Features**

- **Mock KYC Verification** - Risk assessment using external API integration
- **Transaction Receipts** - PDF and CSV generation for professional documentation
- **Admin Export** - Bulk CSV export for compliance and reporting
- **Unit Tests** - Comprehensive backend testing with Jest

## 🏗️ **Tech Stack**

### **Frontend**

- React.js 18
- TailwindCSS
- Heroicons
- Axios
- date-fns

### **Backend**

- Node.js & Express
- Prisma ORM
- PostgreSQL
- JWT Authentication
- PDFKit & CSV-Writer

### **APIs & Services**

- ExchangeRate API (FX Rates)
- ReqRes API (Mock KYC)
- Custom receipt generation

## 📁 **Project Structure**

```
PAYSTREET/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── pages/           # Application pages
│   │   └── index.js         # Entry point
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── backend/                  # Node.js backend API
│   ├── routes/              # API route handlers
│   ├── middleware/          # Authentication middleware
│   ├── prisma/              # Database schema & migrations
│   ├── utils/               # Utility functions
│   ├── tests/               # Unit tests
│   └── server.js            # Express server
├── deploy.sh                 # Deployment script
└── README.md                 # This file
```

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### **1. Clone Repository**

```bash
git clone https://github.com/yourusername/paystreet.git
cd paystreet
```

### **2. Backend Setup**

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma db push
npx prisma db seed

# Start backend server
npm start
```

### **3. Frontend Setup**

```bash
cd frontend
npm install
npm start
```

### **4. Access Application**

- Frontend: http://localhost:3000
- Backend: http://localhost:5001
- Admin Login: admin@paystreet.com / admin123
- User Login: user@paystreet.com / user123

## 🔧 **Environment Variables**

### **Backend (.env)**

```env
DATABASE_URL="postgresql://username:password@localhost:5432/paystreet"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5001
EXCHANGE_RATE_API_URL="https://api.exchangerate.host"
```

## 📊 **API Endpoints**

### **Authentication**

- `POST /api/auth/signup` - User registration with KYC
- `POST /api/auth/login` - User login
- `GET /api/auth/kyc-status/:userId` - KYC status check

### **FX Rates**

- `POST /api/fx-rates/convert` - Currency conversion
- `GET /api/fx-rates/currencies` - Available currencies
- `GET /api/fx-rates/rate/:from/:to` - Get specific rate

### **Transactions**

- `GET /api/transactions` - User transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id/receipt` - Download receipt
- `GET /api/transactions/export/csv` - Admin export

### **Beneficiaries**

- `GET /api/beneficiaries` - User beneficiaries
- `POST /api/beneficiaries` - Add beneficiary
- `PUT /api/beneficiaries/:id` - Update beneficiary
- `DELETE /api/beneficiaries/:id` - Delete beneficiary

## 🧪 **Testing**

### **Run Backend Tests**

```bash
cd backend
npm test
```

### **Test Coverage**

- Authentication routes
- FX rates conversion
- KYC verification
- Receipt generation

## 🚀 **Deployment**

### **Backend (Render/Heroku)**

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### **Frontend (Vercel)**

1. Import from GitHub
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/build`

## 📱 **Demo Accounts**

### **Admin User**

- Email: admin@paystreet.com
- Password: admin123
- Access: Full admin panel, user management

### **Regular User**

- Email: user@paystreet.com
- Password: user123
- Access: Personal dashboard, transactions

## 🔒 **Security Features**

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS protection

## 📈 **Performance Features**

- FX rates caching (15 minutes)
- Database connection pooling
- Optimized queries with Prisma
- Responsive UI with TailwindCSS

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 **Support**

For support and questions:

- Create an issue in the GitHub repository
- Contact: your-email@example.com

---

**Built with ❤️ for modern cross-border remittance solutions**
