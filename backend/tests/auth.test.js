const request = require('supertest');
const app = require('./test-server');

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn()
    },
    kycStatus: {
      findUnique: jest.fn(),
      create: jest.fn()
    }
  }))
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

// Mock axios
jest.mock('axios');

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

describe('Auth Routes', () => {
  let mockPrisma;
  let mockBcrypt;
  let mockJwt;
  let mockAxios;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient();
    mockBcrypt = bcrypt;
    mockJwt = jwt;
    mockAxios = axios;
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      };

      // Mock Prisma responses
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user123',
        email: userData.email,
        fullName: userData.fullName,
        accountNumber: 'ACC123456',
        createdAt: new Date()
      });

      // Mock bcrypt
      mockBcrypt.hash.mockResolvedValue('hashedPassword');

      // Mock KYC verification
      mockAxios.get.mockResolvedValue({
        data: {
          data: {
            id: 1,
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User'
          }
        }
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User created successfully');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.fullName).toBe(userData.fullName);
    });

    it('should reject signup if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        fullName: 'Existing User'
      };

      // Mock existing user
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing123',
        email: userData.email
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('User with this email already exists');
    });

    it('should reject signup for high-risk profiles', async () => {
      const userData = {
        email: 'highrisk@example.com',
        password: 'password123',
        fullName: 'High Risk User'
      };

      // Mock Prisma responses
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Mock KYC verification failure (high risk)
      mockAxios.get.mockRejectedValue(new Error('High risk profile'));

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('KYC verification failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 'user123',
        email: loginData.email,
        password: 'hashedPassword',
        fullName: 'Test User',
        role: 'USER'
      };

      // Mock Prisma response
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Mock bcrypt comparison
      mockBcrypt.compare.mockResolvedValue(true);

      // Mock JWT signing
      mockJwt.sign.mockReturnValue('mock.jwt.token');

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.token).toBeDefined();
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      // Mock Prisma response - user not found
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/kyc-status/:userId', () => {
    it('should return KYC status for user', async () => {
      const userId = 'user123';
      const mockKycStatus = {
        id: 'kyc123',
        userId: userId,
        verified: true,
        status: 'VERIFIED',
        verifiedAt: new Date()
      };

      // Mock Prisma response
      mockPrisma.kycStatus.findUnique.mockResolvedValue(mockKycStatus);

      const response = await request(app)
        .get(`/api/auth/kyc-status/${userId}`)
        .expect(200);

      expect(response.body.kycStatus.verified).toBe(true);
      expect(response.body.kycStatus.status).toBe('VERIFIED');
    });

    it('should return 404 for non-existent user', async () => {
      const userId = 'nonexistent123';

      // Mock Prisma response - KYC status not found
      mockPrisma.kycStatus.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/auth/kyc-status/${userId}`)
        .expect(404);

      expect(response.body.error).toBe('KYC status not found');
    });
  });
});
