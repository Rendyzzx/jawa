import { loginSchema, changeCredentialsSchema, type LoginRequest, type ChangeCredentialsRequest, type User } from "@shared/schema";
import { storage } from "./storage";

class AuthService {
  async validateLogin(loginData: LoginRequest): Promise<User | null> {
    const validation = loginSchema.safeParse(loginData);
    if (!validation.success) return null;

    const user = await storage.getUserByUsername(loginData.username);
    if (!user) return null;

    // Simple password comparison (in production, use bcrypt)
    if (user.password === loginData.password) {
      return user;
    }

    return null;
  }

  async changeCredentials(userId: number, currentPassword: string, changes: ChangeCredentialsRequest): Promise<boolean> {
    const validation = changeCredentialsSchema.safeParse(changes);
    if (!validation.success) return false;

    const user = await storage.getUserById(userId);
    if (!user || user.password !== currentPassword) {
      return false;
    }

    // Update user credentials
    await storage.updateUser(userId, {
      username: changes.newUsername,
      password: changes.newPassword,
    });

    return true;
  }

  isAdmin(user: User | null): boolean {
    return user?.role === "admin";
  }

  canDeleteNumbers(user: User | null): boolean {
    return this.isAdmin(user);
  }
}

export const authService = new AuthService();
