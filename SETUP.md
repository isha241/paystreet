# PayStreet Setup Guide

This guide will help you set up and run the PayStreet cross-border remittance portal locally.

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL 14+** - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

## Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd paystreet-remittance-portal
```

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Database Setup

#### Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE paystreet;
CREATE USER paystreet_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE paystreet TO paystreet_user;

# Exit PostgreSQL
\q
```

#### Configure Environment Variables
```bash
# Copy environment template
cp backend/env.example backend/.env

# Edit backend/.env with your database credentials
DATABASE_URL="postgresql://paystreet_user:your_password@localhost:5432/paystreet"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

### 4. Initialize Database
```bash
npm run setup-db
```

This will:
- Create database tables
- Seed initial data including:
  - Admin user: `admin@paystreet.com` / `admin123`
  - Sample user: `user@example.com` / `password123`
  - Sample beneficiaries and transactions

### 5. Start Development Servers
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## Project Structure

```
paystreet-remittance-portal/
├── backend/                 # Node.js + Express API
│   ├── routes/             # API route handlers
│   ├── middleware/         # Authentication & validation
│   ├── utils/              # Utility functions
│   ├── prisma/             # Database schema & migrations
│   └── server.js           # Main server file
├── frontend/               # React + TailwindCSS
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── App.js          # Main app component
│   └── public/             # Static assets
├── package.json            # Root package.json
└── README.md               # Project documentation
```

## Features

### ✅ Core Features Implemented
- **User Authentication**: JWT-based signup/login with auto-generated account numbers
- **Beneficiary Management**: Add/edit/delete beneficiaries with country and currency support
- **Money Transfer Workflow**: Real-time FX conversion with live rates API
- **Transaction Dashboard**: Complete transaction history with filtering and search
- **Admin Panel**: Role-based access to view all users and transactions
- **High-Risk Detection**: Automatic flagging of transactions above $10,000

### 🔧 Technical Features
- **Real-time FX Rates**: Integration with ExchangeRate API
- **Responsive UI**: Modern React + TailwindCSS design
- **Secure Backend**: Node.js + Express with JWT authentication
- **Database**: PostgreSQL with Prisma ORM
- **Error Handling**: Graceful API error handling and user feedback

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Beneficiaries
- `GET /api/beneficiaries` - Get user's beneficiaries
- `POST /api/beneficiaries` - Add new beneficiary
- `PUT /api/beneficiaries/:id` - Update beneficiary
- `DELETE /api/beneficiaries/:id` - Delete beneficiary

### Transactions
- `GET /api/transactions` - Get user's transactions
- `POST /api/transactions` - Create new transaction

### FX Rates
- `POST /api/fx-rates/convert` - Convert currency with live rates

## Demo Credentials

### Regular User
- **Email**: `user@example.com`
- **Password**: `password123`

### Admin User
- **Email**: `admin@paystreet.com`
- **Password**: `admin123`

## Development

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm run setup-db     # Setup database
npm test            # Run tests
```

### Frontend Development
```bash
cd frontend
npm start           # Start development server
npm run build       # Build for production
npm test            # Run tests
```

### Database Management
```bash
cd backend
npx prisma studio   # Open Prisma Studio
npx prisma db push  # Push schema changes
npx prisma db seed  # Seed database
```

## Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/paystreet"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# Server
PORT=5000
NODE_ENV=development

# External APIs
EXCHANGE_RATE_API_URL="https://api.exchangerate.host"

# Admin
ADMIN_EMAIL="admin@paystreet.com"
ADMIN_PASSWORD="admin123"
```

## Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Render/Heroku)
1. Connect your GitHub repo
2. Set environment variables
3. Deploy as a Web Service

## Troubleshooting

### Common Issues

#### Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

#### Port Already in Use
- Change port in backend `.env` file
- Kill processes using ports 3000/5000

#### Dependencies Issues
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

#### Prisma Issues
```bash
cd backend
npx prisma generate
npx prisma db push
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Open an issue on GitHub

## License

This project is licensed under the MIT License.
