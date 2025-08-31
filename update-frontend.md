# Frontend Code Update Guide

## 🔧 **Step-by-Step Changes Needed**

### **1. Add API Base URL Constant**

**In `frontend/src/contexts/AuthContext.tsx`, add this line after the imports (around line 9):**

```typescript
// API base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || '';
```

### **2. Update API Calls**

**Change these lines in the same file:**

**Line ~75 (verifyToken function):**
```typescript
// FROM:
const response = await axios.get("/api/users/profile");

// TO:
const response = await axios.get(`${API_BASE_URL}/api/users/profile`);
```

**Line ~91 (login function):**
```typescript
// FROM:
const response = await axios.post<LoginResponse>("/api/auth/login", {

// TO:
const response = await axios.post<LoginResponse>(`${API_BASE_URL}/api/auth/login`, {
```

**Line ~110 (adminLogin function):**
```typescript
// FROM:
const response = await axios.post<LoginResponse>("/api/auth/login", {

// TO:
const response = await axios.post<LoginResponse>(`${API_BASE_URL}/api/auth/login`, {
```

**Line ~140 (signup function):**
```typescript
// FROM:
const response = await axios.post<SignupResponse>("/api/auth/signup", {

// TO:
const response = await axios.post<SignupResponse>(`${API_BASE_URL}/api/auth/signup`, {
```

### **3. After Making Changes**

1. **Save the file**
2. **Commit and push** to GitHub:
   ```bash
   git add .
   git commit -m "Update frontend to use API_BASE_URL environment variable"
   git push
   ```
3. **Vercel will auto-deploy** with the new code
4. **Your app will work** because it will call the correct backend URL

## 🎯 **What This Fixes**

- **Before**: Frontend calls `/api/auth/login` (goes to frontend URL)
- **After**: Frontend calls `https://paystreet.onrender.com/api/auth/login` (goes to backend)

## ✅ **Result**

Your PayStreet app will successfully connect to your Render backend and login will work!
