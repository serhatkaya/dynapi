import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  static #instance;
  #client;
  #db = null;

  constructor() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    this.#client = new MongoClient(uri);
  }

  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }

  async connect() {
    try {
      await this.#client.connect();
      this.#db = this.#client.db('dynamic');
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  getDb() {
    if (!this.#db) {
      throw new Error('Database not connected');
    }
    return this.#db;
  }

  async disconnect() {
    await this.#client.close();
    this.#db = null;
  }
}

export { Database };
