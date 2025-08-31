import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

// Type definitions
interface User {
  id: string;
  email: string;
  fullName: string;
  accountNumber: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<void>;
}

interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

interface SignupResponse {
  message: string;
  user: User;
  token: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Set auth token in axios headers
  const setAuthToken = (token: string | null) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  };

  // Verify JWT token on app load
  const verifyToken = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      setAuthToken(token);

      const response = await axios.get("/api/users/profile");
      setUser(response.data.user);
    } catch (error) {
      console.error("Token verification failed:", error);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // User login
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await axios.post<LoginResponse>("/api/auth/login", {
        email,
        password,
      });

      const { user: userData, token } = response.data;
      setUser(userData);
      setAuthToken(token);
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("Login failed. Please try again.");
    }
  };

  // Admin login
  const adminLogin = async (email: string, password: string): Promise<void> => {
    try {
      const response = await axios.post<LoginResponse>("/api/auth/login", {
        email,
        password,
      });

      const { user: userData, token } = response.data;

      if (userData.role !== "ADMIN") {
        throw new Error("Access denied. Admin privileges required.");
      }

      setUser(userData);
      setAuthToken(token);
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("Admin login failed. Please try again.");
    }
  };

  // User signup
  const signup = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<void> => {
    try {
      const response = await axios.post<SignupResponse>("/api/auth/signup", {
        email,
        password,
        fullName,
      });

      const { user: userData, token } = response.data;
      setUser(userData);
      setAuthToken(token);
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("Signup failed. Please try again.");
    }
  };

  // User logout
  const logout = (): void => {
    setUser(null);
    setAuthToken(null);
  };

  // Effect to verify token on mount
  useEffect(() => {
    verifyToken();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    adminLogin,
    signup,
    logout,
    verifyToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
