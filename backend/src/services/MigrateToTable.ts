import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class MigrateToTable {
  private client: Client;
  private sqlDir: string;

  constructor() {
    this.client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    this.sqlDir = path.join(__dirname, '../resources/sql');
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log('Connected to PostgreSQL database');
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.end();
      console.log('Disconnected from PostgreSQL database');
    } catch (error) {
      console.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  private getSqlFiles(): string[] {
    try {
      if (!fs.existsSync(this.sqlDir)) {
        console.log('SQL directory does not exist:', this.sqlDir);
        return [];
      }

      const files = fs.readdirSync(this.sqlDir);
      return files.filter(file => file.endsWith('.sql'));
    } catch (error) {
      console.error('Error reading SQL directory:', error);
      throw error;
    }
  }

  private readSqlFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      console.error(`Error reading SQL file ${filePath}:`, error);
      throw error;
    }
  }

  private async executeSql(sql: string, fileName: string): Promise<void> {
    try {
      console.log(`Executing SQL from ${fileName}...`);

      // Split SQL into individual statements
      // First, remove comments and normalize line breaks
      const cleanSql = sql
        .replace(/--.*$/gm, '') // Remove single-line comments
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      const statements = cleanSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      console.log(`Found ${statements.length} SQL statements to execute`);
      console.log('Clean SQL:', cleanSql.substring(0, 200) + '...');
      console.log('Statements:', statements);

      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          await this.client.query(statement);
        }
      }

      console.log(`Successfully executed all SQL statements from ${fileName}`);
    } catch (error) {
      console.error(`Error executing SQL from ${fileName}:`, error);
      console.error('SQL that failed:', sql);
      throw error;
    }
  }

  private deleteSqlFile(filePath: string): void {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted SQL file: ${filePath}`);
    } catch (error) {
      console.error(`Error deleting SQL file ${filePath}:`, error);
      throw error;
    }
  }

  async migrate(): Promise<void> {
    try {
      console.log('Starting migration process...');
      console.log('SQL Directory:', this.sqlDir);
      console.log('Database config:', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER
      });

      await this.connect();

      const sqlFiles = this.getSqlFiles();
      console.log(`Found ${sqlFiles.length} SQL files to process:`, sqlFiles);

      if (sqlFiles.length === 0) {
        console.log('No SQL files found to process');
        return;
      }

      for (const file of sqlFiles) {
        const filePath = path.join(this.sqlDir, file);
        console.log(`Processing file: ${filePath}`);

        const sql = this.readSqlFile(filePath);
        console.log(`SQL content length: ${sql.length} characters`);

        await this.executeSql(sql, file);
        this.deleteSqlFile(filePath);
      }

      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}