import { numbers, type Number, type InsertNumber } from "@shared/schema";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  getNumbers(): Promise<Number[]>;
  addNumber(number: InsertNumber): Promise<Number>;
  deleteNumber(id: number): Promise<boolean>;
  initializeData(): Promise<void>;
}

export class FileStorage implements IStorage {
  private dataPath: string;
  private numbersCache: Number[] = [];
  private currentId: number = 1;

  constructor() {
    this.dataPath = path.join(process.cwd(), "server", "data", "numbers.json");
  }

  async initializeData(): Promise<void> {
    try {
      const data = await fs.readFile(this.dataPath, "utf-8");
      const parsed = JSON.parse(data);
      this.numbersCache = parsed.numbers || [];
      this.currentId = parsed.nextId || 1;
    } catch (error) {
      // File doesn't exist or is invalid, start with empty data
      this.numbersCache = [];
      this.currentId = 1;
      await this.saveData();
    }
  }

  private async saveData(): Promise<void> {
    const data = {
      numbers: this.numbersCache,
      nextId: this.currentId,
    };
    
    // Ensure directory exists
    const dir = path.dirname(this.dataPath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2));
  }

  async getNumbers(): Promise<Number[]> {
    return [...this.numbersCache].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async addNumber(insertNumber: InsertNumber): Promise<Number> {
    const number: Number = {
      id: this.currentId++,
      number: insertNumber.number,
      note: insertNumber.note || null,
      createdAt: new Date(),
    };
    
    this.numbersCache.push(number);
    await this.saveData();
    return number;
  }

  async deleteNumber(id: number): Promise<boolean> {
    const index = this.numbersCache.findIndex(n => n.id === id);
    if (index === -1) return false;
    
    this.numbersCache.splice(index, 1);
    await this.saveData();
    return true;
  }
}

export const storage = new FileStorage();
