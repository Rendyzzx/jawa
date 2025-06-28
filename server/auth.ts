import fs from "fs/promises";
import path from "path";
import { loginSchema, type LoginRequest } from "@shared/schema";

interface Credentials {
  username: string;
  password: string;
}

class AuthService {
  private credentialsPath: string;
  private credentials: Credentials | null = null;

  constructor() {
    this.credentialsPath = path.join(process.cwd(), "server", "config", "credentials.json");
  }

  async initializeCredentials(): Promise<void> {
    try {
      const data = await fs.readFile(this.credentialsPath, "utf-8");
      this.credentials = JSON.parse(data);
    } catch (error) {
      // Default credentials if file doesn't exist
      this.credentials = {
        username: "admin",
        password: "admin123"
      };
      await this.saveCredentials();
    }
  }

  private async saveCredentials(): Promise<void> {
    if (!this.credentials) return;
    
    // Ensure directory exists
    const dir = path.dirname(this.credentialsPath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(this.credentialsPath, JSON.stringify(this.credentials, null, 2));
  }

  async validateLogin(loginData: LoginRequest): Promise<boolean> {
    const validation = loginSchema.safeParse(loginData);
    if (!validation.success) return false;

    if (!this.credentials) {
      await this.initializeCredentials();
    }

    return (
      this.credentials!.username === loginData.username &&
      this.credentials!.password === loginData.password
    );
  }
}

export const authService = new AuthService();
