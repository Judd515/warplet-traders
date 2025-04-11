import { traders, type Trader, type InsertTrader, users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods (keeping these for compatibility)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Trader methods
  getTraders(): Promise<Trader[]>;
  updateTraders(tradersList: InsertTrader[]): Promise<Trader[]>;
}

// Database storage implementation that stores data in PostgreSQL
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Trader methods
  async getTraders(): Promise<Trader[]> {
    return await db.select().from(traders);
  }
  
  async updateTraders(tradersList: InsertTrader[]): Promise<Trader[]> {
    // First delete all existing traders
    await db.delete(traders);
    
    // Then insert the new traders
    if (tradersList.length > 0) {
      const result = await db.insert(traders).values(tradersList).returning();
      return result;
    }
    
    return [];
  }
}

// Use in-memory storage for development without a database
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private traders: Map<number, Trader>;
  private userCurrentId: number;
  private traderCurrentId: number;

  constructor() {
    this.users = new Map();
    this.traders = new Map();
    this.userCurrentId = 1;
    this.traderCurrentId = 1;
  }

  // User methods (keeping these for compatibility)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Trader methods
  async getTraders(): Promise<Trader[]> {
    return Array.from(this.traders.values());
  }
  
  async updateTraders(tradersList: InsertTrader[]): Promise<Trader[]> {
    // Clear existing traders
    this.traders.clear();
    
    // Add new traders
    const updatedTraders: Trader[] = [];
    tradersList.forEach((trader) => {
      const id = this.traderCurrentId++;
      const newTrader: Trader = { ...trader, id };
      this.traders.set(id, newTrader);
      updatedTraders.push(newTrader);
    });
    
    return updatedTraders;
  }
}

// Use the database storage for production or use memory storage for development
export const storage = process.env.NODE_ENV === 'production' 
  ? new DatabaseStorage() 
  : new MemStorage();
