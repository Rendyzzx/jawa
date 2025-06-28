import { numbers, users, type Number, type InsertNumber, type User, type InsertUser, type UpdateUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  // Numbers management
  getNumbers(): Promise<Number[]>;
  addNumber(number: InsertNumber): Promise<Number>;
  deleteNumber(id: number): Promise<boolean>;
  
  // User management
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: UpdateUser): Promise<User | undefined>;
  
  // Initialization
  initializeData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async initializeData(): Promise<void> {
    try {
      // Check if admin user exists, if not create one
      const adminUser = await this.getUserByUsername("admin");
      if (!adminUser) {
        await this.createUser({
          username: "admin",
          password: "admin123",
          role: "admin"
        });
      }

      // Check if regular user exists, if not create one
      const regularUser = await this.getUserByUsername("danixren");
      if (!regularUser) {
        await this.createUser({
          username: "danixren",
          password: "pendukungjava",
          role: "user"
        });
      }
    } catch (error) {
      console.error("Failed to initialize data:", error);
    }
  }

  // Numbers management
  async getNumbers(): Promise<Number[]> {
    const result = await db.select().from(numbers).orderBy(numbers.createdAt);
    return result.reverse(); // Most recent first
  }

  async addNumber(insertNumber: InsertNumber): Promise<Number> {
    const [number] = await db
      .insert(numbers)
      .values(insertNumber)
      .returning();
    return number;
  }

  async deleteNumber(id: number): Promise<boolean> {
    const result = await db
      .delete(numbers)
      .where(eq(numbers.id, id))
      .returning();
    return result.length > 0;
  }

  // User management
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  async updateUser(id: number, updates: UpdateUser): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
}

export const storage = new DatabaseStorage();
