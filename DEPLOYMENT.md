# 🚀 PayStreet Deployment Guide

This guide will walk you through deploying PayStreet to production on Vercel (Frontend) and Render/Heroku (Backend).

## 📋 **Prerequisites**

- GitHub repository with your code
- Vercel account (free)
- Render account (free) or Heroku account
- PostgreSQL database (Render, Heroku, or external)

## 🌐 **Platform Options**

### **Frontend Hosting**
- ✅ **Vercel** (Recommended) - Best for React apps, automatic deployments
- ✅ **Netlify** - Alternative with similar features
- ✅ **GitHub Pages** - Free but limited

### **Backend Hosting**
- ✅ **Render** (Recommended) - Free tier, easy PostgreSQL integration
- ✅ **Heroku** - Reliable but requires credit card for free tier
- ✅ **Railway** - Modern alternative with good free tier

## 🚀 **Step 1: Deploy Frontend to Vercel**

### **Option A: Using Vercel CLI (Recommended)**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project root**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Follow the prompts:**
   - Set project name: `paystreet-frontend`
   - Set build command: `npm run build`
   - Set output directory: `build`
   - Set development command: `npm start`

### **Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

## 🖥️ **Step 2: Deploy Backend to Render**

### **1. Connect Repository**

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository and branch

### **2. Configure Service**

- **Name**: `paystreet-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`

### **3. Environment Variables**

Add these environment variables:

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-here
EXCHANGE_RATE_API_URL=https://api.exchangerate.host
DATABASE_URL=your-postgresql-connection-string
```

### **4. Database Setup**

**Option A: Render PostgreSQL (Recommended)**
1. Create new PostgreSQL service
2. Copy connection string to `DATABASE_URL`
3. Run migrations: `npx prisma db push`

**Option B: External PostgreSQL**
1. Use services like Supabase, Neon, or Railway
2. Copy connection string to `DATABASE_URL`

## 🖥️ **Step 3: Deploy Backend to Heroku (Alternative)**

### **1. Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

### **2. Login and Create App**
```bash
heroku login
heroku create paystreet-backend
```

### **3. Add PostgreSQL**
```bash
heroku addons:create heroku-postgresql:mini
```

### **4. Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key
heroku config:set EXCHANGE_RATE_API_URL=https://api.exchangerate.host
```

### **5. Deploy**
```bash
git push heroku main
```

### **6. Run Database Migrations**
```bash
heroku run npx prisma db push
heroku run npx prisma db seed
```

## 🔧 **Step 4: Update Frontend Configuration**

### **1. Update API URL**

After backend deployment, update your frontend environment:

```bash
# If using Vercel CLI
vercel env add REACT_APP_API_URL

# Or in Vercel dashboard:
# Settings → Environment Variables → Add REACT_APP_API_URL
```

Set the value to your backend URL:
- Render: `https://paystreet-backend.onrender.com`
- Heroku: `https://paystreet-backend.herokuapp.com`

### **2. Redeploy Frontend**
```bash
vercel --prod
```

## 🧪 **Step 5: Test Deployment**

### **1. Health Check**
```bash
# Test backend health
curl https://your-backend-url.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

### **2. Test API Endpoints**
```bash
# Test FX rates
curl https://your-backend-url.com/api/fx-rates/currencies

# Test authentication
curl -X POST https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@paystreet.com","password":"admin123"}'
```

### **3. Test Frontend**
- Open your Vercel URL
- Try logging in with demo accounts
- Test all features (FX conversion, transactions, etc.)

## 📊 **Step 6: Monitor and Maintain**

### **1. Set Up Monitoring**
- **Vercel Analytics**: Built-in performance monitoring
- **Render Logs**: View application logs in dashboard
- **Health Checks**: Monitor `/health` endpoint

### **2. Database Management**
```bash
# View database in Render dashboard
# Or connect via CLI:
npx prisma studio
```

### **3. Update Deployments**
- **Automatic**: Both platforms auto-deploy on git push
- **Manual**: Use platform dashboards or CLI commands

## 🚨 **Troubleshooting**

### **Common Issues**

**1. Build Failures**
```bash
# Check build logs in platform dashboard
# Verify package.json scripts
# Check for missing dependencies
```

**2. Database Connection Issues**
```bash
# Verify DATABASE_URL format
# Check database service status
# Ensure IP whitelist includes platform
```

**3. CORS Errors**
```bash
# Verify backend CORS configuration
# Check frontend API URL
# Ensure protocols match (http vs https)
```

**4. Environment Variables**
```bash
# Verify all required variables are set
# Check variable names (case-sensitive)
# Restart service after adding variables
```

## 📱 **Demo Accounts**

After deployment, test with these accounts:

### **Admin User**
- Email: `admin@paystreet.com`
- Password: `admin123`

### **Regular User**
- Email: `user@paystreet.com`
- Password: `user123`

## 🔗 **Useful Links**

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Heroku Documentation](https://devcenter.heroku.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)

## 📞 **Support**

If you encounter issues:
1. Check platform logs and documentation
2. Verify environment variables
3. Test locally first
4. Create GitHub issues for code problems

---

**Happy Deploying! 🚀**
