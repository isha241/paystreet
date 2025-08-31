# ✅ PayStreet Deployment Checklist

Use this checklist to ensure successful deployment of your PayStreet application.

## 🚀 **Pre-Deployment Checklist**

### **GitHub Repository**
- [ ] Repository is public and accessible
- [ ] All code is committed and pushed
- [ ] Main branch contains latest code
- [ ] README.md is comprehensive and clear

### **Local Testing**
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend tests pass (`npm test`)
- [ ] Application works locally
- [ ] Database connection is stable

## 🌐 **Frontend Deployment (Vercel)**

### **Setup**
- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`

### **Deploy**
- [ ] Navigate to frontend directory: `cd frontend`
- [ ] Run: `vercel --prod`
- [ ] Set project name: `paystreet-frontend`
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `build`
- [ ] Note the deployment URL

### **Configure**
- [ ] Set environment variable: `REACT_APP_API_URL`
- [ ] Value: Your backend URL (will set after backend deployment)
- [ ] Redeploy if needed: `vercel --prod`

## 🖥️ **Backend Deployment (Render)**

### **Setup**
- [ ] Create Render account at [render.com](https://render.com)
- [ ] Connect GitHub repository
- [ ] Create new Web Service

### **Configure Service**
- [ ] Name: `paystreet-backend`
- [ ] Environment: `Node`
- [ ] Build Command: `cd backend && npm install`
- [ ] Start Command: `cd backend && npm start`
- [ ] Plan: Free

### **Environment Variables**
- [ ] `NODE_ENV`: `production`
- [ ] `PORT`: `10000`
- [ ] `JWT_SECRET`: Generate secure random string
- [ ] `EXCHANGE_RATE_API_URL`: `https://api.exchangerate.host`
- [ ] `DATABASE_URL`: Your PostgreSQL connection string

### **Database Setup**
- [ ] Create PostgreSQL service in Render
- [ ] Copy connection string to `DATABASE_URL`
- [ ] Deploy service
- [ ] Run migrations: `npx prisma db push`
- [ ] Seed database: `npx prisma db seed`

## 🔗 **Connect Frontend to Backend**

### **Update Frontend**
- [ ] Go to Vercel dashboard
- [ ] Navigate to project settings
- [ ] Add environment variable: `REACT_APP_API_URL`
- [ ] Set value to your Render backend URL
- [ ] Redeploy frontend

### **Test Connection**
- [ ] Open frontend URL
- [ ] Try to login with demo accounts
- [ ] Test FX conversion
- [ ] Test transaction creation
- [ ] Test receipt download

## 📊 **Post-Deployment Verification**

### **Health Checks**
- [ ] Backend health endpoint: `/health`
- [ ] Frontend loads without errors
- [ ] All API endpoints respond correctly
- [ ] Database queries work

### **Feature Testing**
- [ ] User registration and login
- [ ] Admin panel access
- [ ] Beneficiary management
- [ ] FX rate conversion
- [ ] Transaction creation
- [ ] Receipt generation (PDF/CSV)
- [ ] Admin export functionality

### **Performance**
- [ ] Page load times are acceptable
- [ ] API responses are fast
- [ ] Database queries are optimized
- [ ] FX rates cache is working

## 🚨 **Troubleshooting Common Issues**

### **Build Failures**
- [ ] Check package.json scripts
- [ ] Verify all dependencies are installed
- [ ] Check for syntax errors
- [ ] Review build logs

### **Database Issues**
- [ ] Verify DATABASE_URL format
- [ ] Check database service status
- [ ] Ensure IP whitelist includes platform
- [ ] Test connection locally

### **CORS Errors**
- [ ] Verify backend CORS configuration
- [ ] Check frontend API URL
- [ ] Ensure protocols match (http vs https)
- [ ] Test with Postman/curl

### **Environment Variables**
- [ ] Verify all required variables are set
- [ ] Check variable names (case-sensitive)
- [ ] Restart service after adding variables
- [ ] Use platform's environment variable interface

## 📱 **Demo Accounts for Testing**

### **Admin User**
- Email: `admin@paystreet.com`
- Password: `admin123`

### **Regular User**
- Email: `user@paystreet.com`
- Password: `user123`

## 🔗 **Final URLs to Document**

- [ ] Frontend URL: `https://your-app.vercel.app`
- [ ] Backend URL: `https://your-app.onrender.com`
- [ ] Database: Render PostgreSQL service
- [ ] GitHub Repository: `https://github.com/username/paystreet`

## 📹 **Optional: Loom Video Walkthrough**

- [ ] Record 3-5 minute demo video
- [ ] Show all major features
- [ ] Demonstrate user flows
- [ ] Highlight technical features
- [ ] Upload to Loom and get shareable link

---

## 🎉 **Deployment Complete!**

Once all items are checked, your PayStreet application is successfully deployed and ready for use!

**Next Steps:**
1. Share the deployed URLs
2. Test with real users
3. Monitor performance
4. Plan future enhancements

---

**Need Help?** Check the [DEPLOYMENT.md](DEPLOYMENT.md) file for detailed instructions.
