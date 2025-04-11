import { traders, type Trader, type InsertTrader, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // User methods (keeping these for compatibility)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Trader methods
  getTraders(): Promise<Trader[]>;
  updateTraders(tradersList: InsertTrader[]): Promise<Trader[]>;
}

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

export const storage = new MemStorage();
