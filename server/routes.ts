import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { authService } from "./auth";
import { insertNumberSchema, loginSchema, changeCredentialsSchema } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    isAuthenticated?: boolean;
    userId?: number;
    username?: string;
    role?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize storage
  await storage.initializeData();

  // Session middleware with PostgreSQL store
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 30 * 60 * 1000, // 30 minutes
    },
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.isAuthenticated) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session.isAuthenticated || req.session.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const user = await authService.validateLogin(loginData);
      
      if (user) {
        req.session.isAuthenticated = true;
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;
        res.json({ success: true, message: "Login successful" });
      } else {
        res.status(401).json({ message: "Invalid username or password" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Check auth status
  app.get("/api/auth/me", async (req, res) => {
    if (req.session.isAuthenticated) {
      try {
        // Verify user still exists in secure storage
        const user = await authService.getUserById(req.session.userId!);
        if (user) {
          res.json({ 
            isAuthenticated: true,
            userId: user.id,
            username: user.username,
            role: user.role
          });
        } else {
          // User not found, clear session
          req.session.destroy(() => {
            res.json({ isAuthenticated: false });
          });
        }
      } catch (error) {
        console.error("Error verifying user:", error);
        res.status(500).json({ message: "Failed to verify user" });
      }
    } else {
      res.json({ isAuthenticated: false });
    }
  });

  // Change credentials (admin only)
  app.post("/api/auth/change-credentials", requireAdmin, async (req, res) => {
    try {
      const changeData = changeCredentialsSchema.parse(req.body);
      const success = await authService.changeCredentials(
        req.session.userId!,
        changeData.currentPassword,
        changeData
      );
      
      if (success) {
        // Update session with new username
        req.session.username = changeData.newUsername;
        res.json({ success: true, message: "Credentials updated successfully" });
      } else {
        res.status(400).json({ message: "Current password is incorrect" });
      }
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update credentials" });
      }
    }
  });

  // Get all numbers (protected)
  app.get("/api/numbers", requireAuth, async (req, res) => {
    try {
      const numbers = await storage.getNumbers();
      res.json(numbers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch numbers" });
    }
  });

  // Add new number (protected)
  app.post("/api/numbers", requireAuth, async (req, res) => {
    try {
      const numberData = insertNumberSchema.parse(req.body);
      const newNumber = await storage.addNumber(numberData);
      res.status(201).json(newNumber);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid number data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add number" });
      }
    }
  });

  // Delete number (admin only)
  app.delete("/api/numbers/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid number ID" });
      }
      
      const deleted = await storage.deleteNumber(id);
      if (deleted) {
        res.json({ message: "Number deleted successfully" });
      } else {
        res.status(404).json({ message: "Number not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete number" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
