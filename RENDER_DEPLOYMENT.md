# 🚀 Render Backend Deployment Guide for PayStreet

## **Step-by-Step Backend Deployment to Render**

### **1. Prerequisites**

- ✅ GitHub repository ready: `isha241/paystreet`
- ✅ Frontend deployed to Vercel
- ✅ Backend TypeScript migration complete
- ✅ Render account (free at [render.com](https://render.com))

### **2. Deploy to Render**

#### **Step 2.1: Create Render Account**

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Verify your email address

#### **Step 2.2: Create New Web Service**

1. Click **"New +"** button
2. Select **"Web Service"**
3. Connect your GitHub repository: `isha241/paystreet`

#### **Step 2.3: Configure Service**

Fill in these details:

**Basic Settings:**

- **Name**: `paystreet-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `backend`

**Build & Deploy:**

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Free` (or paid if you prefer)

#### **Step 2.4: Environment Variables**

Add these environment variables:

| Key                     | Value                                                     | Description                 |
| ----------------------- | --------------------------------------------------------- | --------------------------- |
| `NODE_ENV`              | `production`                                              | Environment mode            |
| `PORT`                  | `10000`                                                   | Port (Render will override) |
| `JWT_SECRET`            | `your-super-secret-key`                                   | JWT signing secret          |
| `EXCHANGE_RATE_API_URL` | `https://api.exchangerate.host`                           | FX rates API                |
| `ALLOWED_ORIGINS`       | `https://frontend-olyoqiblf-isha241s-projects.vercel.app` | Frontend URL                |

#### **Step 2.5: Database Setup**

**Option A: Use Render PostgreSQL (Recommended)**

1. Create a new PostgreSQL service in Render
2. Copy the connection string
3. Add `DATABASE_URL` environment variable with the connection string

**Option B: Use External Database**

- Add your existing PostgreSQL connection string
- Ensure it's accessible from Render's servers

### **3. Deployment Process**

#### **Step 3.1: Initial Deploy**

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build the TypeScript code
   - Start the service

#### **Step 3.2: Monitor Deployment**

- Watch the build logs for any errors
- Check the health check endpoint: `/health`
- Verify the service is running

#### **Step 3.3: Get Your Backend URL**

After successful deployment, you'll get:

- **URL**: `https://paystreet-backend.onrender.com`
- **Health Check**: `https://paystreet-backend.onrender.com/health`

### **4. Post-Deployment Setup**

#### **Step 4.1: Update Frontend Environment Variable**

In your Vercel project:

1. Go to Project → Settings → Environment Variables
2. Update `REACT_APP_API_URL` to your new backend URL
3. Redeploy frontend

#### **Step 4.2: Test API Endpoints**

Test these endpoints:

- `GET /health` - Health check
- `GET /api/fx-rates/currencies` - Available currencies
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

#### **Step 4.3: Database Migration**

If using a new database:

1. Run Prisma migrations: `npx prisma migrate deploy`
2. Seed the database: `npx prisma db seed`

### **5. Environment Variables Reference**

#### **Required Variables:**

```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key
EXCHANGE_RATE_API_URL=https://api.exchangerate.host
ALLOWED_ORIGINS=https://frontend-olyoqiblf-isha241s-projects.vercel.app
```

#### **Database Variable:**

```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
```

#### **Optional Variables:**

```bash
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **6. Troubleshooting**

#### **Common Issues:**

**Build Fails:**

- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check TypeScript compilation errors

**Service Won't Start:**

- Check environment variables
- Verify PORT is not conflicting
- Check build logs for errors

**Database Connection Issues:**

- Verify DATABASE_URL is correct
- Check database accessibility
- Ensure database exists and is running

**CORS Errors:**

- Verify ALLOWED_ORIGINS includes your frontend URL
- Check frontend environment variables
- Ensure backend is accessible

### **7. Monitoring & Maintenance**

#### **Health Checks:**

- Monitor `/health` endpoint
- Set up uptime monitoring
- Check Render dashboard regularly

#### **Logs:**

- View logs in Render dashboard
- Set up log aggregation if needed
- Monitor error rates

#### **Scaling:**

- Start with free plan
- Upgrade to paid plan for better performance
- Consider auto-scaling for production

### **8. Security Considerations**

#### **Environment Variables:**

- Never commit secrets to Git
- Use Render's environment variable system
- Rotate JWT secrets regularly

#### **CORS:**

- Only allow necessary origins
- Don't use wildcards in production
- Validate all inputs

#### **Database:**

- Use strong passwords
- Limit database access
- Regular backups

---

## **🚀 Ready to Deploy?**

Your PayStreet backend is now ready for Render deployment! Follow the steps above and you'll have a production-ready backend in minutes.

**After deployment, you'll have:**

- ✅ Production backend URL
- ✅ HTTPS endpoint
- ✅ Proper CORS configuration
- ✅ Database connection
- ✅ Full-stack application

**Need help?** Check the troubleshooting section or refer to the main deployment guide.
