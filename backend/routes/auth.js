const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validateSignup, validateLogin, handleValidationErrors } = require('../utils/validation');
const axios = require('axios');

const router = express.Router();
const prisma = new PrismaClient();

// Mock KYC verification using ReqRes API
const verifyKYC = async (fullName, email) => {
  try {
    // Simulate KYC check with ReqRes API
    const response = await axios.get('https://reqres.in/api/users', {
      timeout: 5000
    });
    
    // Mock KYC validation logic
    const kycResult = {
      verified: true,
      riskScore: Math.floor(Math.random() * 100),
      verificationMethod: 'API_VERIFICATION',
      timestamp: new Date().toISOString()
    };
    
    // Simulate some users as high-risk for demo purposes
    if (fullName.toLowerCase().includes('test') || email.includes('test')) {
      kycResult.verified = false;
      kycResult.riskScore = 85;
      kycResult.reason = 'High-risk profile detected';
    }
    
    return kycResult;
  } catch (error) {
    console.error('KYC API error:', error.message);
    // Fallback to basic verification
    return {
      verified: true,
      riskScore: 25,
      verificationMethod: 'BASIC_VERIFICATION',
      timestamp: new Date().toISOString()
    };
  }
};

// User signup
router.post('/signup', validateSignup, handleValidationErrors, async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Perform KYC verification
    const kycResult = await verifyKYC(fullName, email);
    
    if (!kycResult.verified) {
      return res.status(400).json({ 
        error: 'KYC verification failed', 
        reason: kycResult.reason || 'High-risk profile detected',
        riskScore: kycResult.riskScore
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique account number
    const accountNumber = `ACC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create user with KYC info
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        accountNumber
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        accountNumber: true,
        role: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// User login
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        accountNumber: user.accountNumber,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Admin login
router.post('/admin-login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if it's the admin email
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ error: 'Admin access denied' });
    }

    // Find admin user
    const admin = await prisma.user.findUnique({
      where: { email, role: 'ADMIN' }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Admin user not found' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Admin login successful',
      user: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        accountNumber: admin.accountNumber,
        role: admin.role
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Failed to login as admin' });
  }
});

// Verify token (for frontend token validation)
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        accountNumber: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      valid: true,
      user
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get KYC status for a user
router.get('/kyc-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        kycVerified: true,
        kycRiskScore: true,
        kycVerifiedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      kycStatus: {
        verified: user.kycVerified || false,
        riskScore: user.kycVerified ? 25 : 85,
        verifiedAt: user.kycVerifiedAt,
        status: user.kycVerified ? 'VERIFIED' : 'PENDING'
      }
    });
  } catch (error) {
    console.error('KYC status error:', error);
    res.status(500).json({ error: 'Failed to get KYC status' });
  }
});

module.exports = router;
