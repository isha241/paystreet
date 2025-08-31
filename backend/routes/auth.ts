import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import {
  validateUserRegistration,
  validateUserLogin,
  handleValidationErrors,
} from "../utils/validation";

const router = Router();
const prisma = new PrismaClient();

// Interface definitions
interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface KYCResponse {
  data: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  }[];
}

// User registration with KYC verification
router.post(
  "/signup",
  validateUserRegistration(),
  handleValidationErrors,
  async (req: Request<{}, {}, SignupRequest>, res: Response): Promise<void> => {
    try {
      const { email, password, fullName } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(400).json({
          error: "User with this email already exists",
        });
        return;
      }

      // Perform KYC verification
      try {
        const kycResponse = await axios.get<KYCResponse>(
          "https://reqres.in/api/users",
          { timeout: 10000 }
        );

        // Mock KYC risk assessment
        const isHighRisk =
          fullName.toLowerCase().includes("test") ||
          fullName.toLowerCase().includes("demo") ||
          fullName.toLowerCase().includes("fake");

        if (isHighRisk) {
          res.status(400).json({
            error: "KYC verification failed",
            reason: "High-risk profile detected",
          });
          return;
        }
      } catch (kycError) {
        console.error("KYC verification failed:", kycError);
        res.status(400).json({
          error: "KYC verification failed",
          reason: "External verification service unavailable",
        });
        return;
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate account number
      const accountNumber =
        "ACC" + Math.random().toString(36).substr(2, 9).toUpperCase();

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          accountNumber,
          role: "USER",
        },
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "24h" }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        message: "User created successfully",
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  }
);

// User login
router.post(
  "/login",
  validateUserLogin(),
  handleValidationErrors,
  async (req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "24h" }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: "Login successful",
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  }
);

// Get KYC status for user (simplified for now)
router.get(
  "/kyc-status/:userId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      // For now, return a mock KYC status since the table doesn't exist in schema
      const mockKycStatus = {
        id: "kyc-1",
        userId: userId,
        verified: true,
        status: "VERIFIED",
        verifiedAt: new Date(),
        riskScore: 25,
      };

      res.json({ kycStatus: mockKycStatus });
    } catch (error) {
      console.error("KYC status error:", error);
      res.status(500).json({ error: "Failed to fetch KYC status" });
    }
  }
);

export default router;
