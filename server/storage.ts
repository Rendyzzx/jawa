import { type Number, type InsertNumber, type User, type InsertUser, type UpdateUser } from "@shared/schema";
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

interface FileData {
  numbers: Number[];
  nextNumberId: number;
}

export class FileStorage implements IStorage {
  private dataPath = path.join(process.cwd(), "data", "numbers.json");

  async initializeData(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
      
      // Check if data file exists, if not create it
      try {
        await fs.access(this.dataPath);
      } catch {
        const initialData: FileData = {
          numbers: [],
          nextNumberId: 1
        };
        await fs.writeFile(this.dataPath, JSON.stringify(initialData, null, 2));
      }
    } catch (error) {
      console.error("Failed to initialize data:", error);
    }
  }

  private async readData(): Promise<FileData> {
    try {
      const content = await fs.readFile(this.dataPath, "utf-8");
      return JSON.parse(content);
    } catch {
      return { numbers: [], nextNumberId: 1 };
    }
  }

  private async writeData(data: FileData): Promise<void> {
    await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2));
  }

  // Numbers management
  async getNumbers(): Promise<Number[]> {
    const data = await this.readData();
    return data.numbers.reverse(); // Most recent first
  }

  async addNumber(insertNumber: InsertNumber): Promise<Number> {
    const data = await this.readData();
    const newNumber: Number = {
      id: data.nextNumberId,
      number: insertNumber.number,
      note: insertNumber.note || null,
      createdAt: new Date()
    };
    
    data.numbers.push(newNumber);
    data.nextNumberId++;
    await this.writeData(data);
    
    return newNumber;
  }

  async deleteNumber(id: number): Promise<boolean> {
    const data = await this.readData();
    const initialLength = data.numbers.length;
    data.numbers = data.numbers.filter(n => n.id !== id);
    
    if (data.numbers.length < initialLength) {
      await this.writeData(data);
      return true;
    }
    return false;
  }

  // User management - Using secure user storage
  async getUserByUsername(username: string): Promise<User | undefined> {
    const { secureUserStorage } = await import("./security/userStorage");
    const userData = await secureUserStorage.getUserByUsername(username);
    if (!userData) return undefined;
    
    return {
      id: userData.id,
      username: userData.username,
      role: userData.role,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt)
    };
  }

  async getUserById(id: number): Promise<User | undefined> {
    const { secureUserStorage } = await import("./security/userStorage");
    const userData = await secureUserStorage.getUserById(id);
    if (!userData) return undefined;
    
    return {
      id: userData.id,
      username: userData.username,
      role: userData.role,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt)
    };
  }

  async createUser(user: InsertUser): Promise<User> {
    const { secureUserStorage } = await import("./security/userStorage");
    const userData = await secureUserStorage.createUser(user.username, user.password, (user.role || "user") as "admin" | "user");
    
    return {
      id: userData.id,
      username: userData.username,
      role: userData.role,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt)
    };
  }

  async updateUser(id: number, updates: UpdateUser): Promise<User | undefined> {
    const { secureUserStorage } = await import("./security/userStorage");
    const userData = await secureUserStorage.updateUser(id, {
      username: updates.username,
      role: updates.role as "admin" | "user" | undefined
    });
    if (!userData) return undefined;
    
    return {
      id: userData.id,
      username: userData.username,
      role: userData.role,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt)
    };
  }
}

export const storage = new FileStorage();
