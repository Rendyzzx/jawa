import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { authService } from "./auth";
import { insertNumberSchema, loginSchema } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    isAuthenticated?: boolean;
    username?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize storage and auth
  await storage.initializeData();
  await authService.initializeCredentials();

  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
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

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const isValid = await authService.validateLogin(loginData);
      
      if (isValid) {
        req.session.isAuthenticated = true;
        req.session.username = loginData.username;
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
  app.get("/api/auth/me", (req, res) => {
    if (req.session.isAuthenticated) {
      res.json({ 
        isAuthenticated: true, 
        username: req.session.username 
      });
    } else {
      res.json({ isAuthenticated: false });
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

  // Delete number (protected)
  app.delete("/api/numbers/:id", requireAuth, async (req, res) => {
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
