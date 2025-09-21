import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { SqlValidationService } from './SqlValidationService';
import { SqlDebugHelper } from '../utils/SqlDebugHelper';

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

  private async executeSql(sql: string, fileName: string = 'unknown'): Promise<void> {
    try {
      // Validar SQL antes de executar
      const validation = SqlValidationService.validateSql(sql);

      if (!validation.isValid) {
        console.error('Erros de validação SQL:', validation.errors);
        console.error('SQL problemático:', sql);
        SqlDebugHelper.analyzeSql(sql);
        throw new Error(`SQL inválido: ${validation.errors.join(', ')}`);
      }

      console.log(`Executando SQL válido de ${fileName}:`, sql);

      // Handle different types of SQL content
      let statements: string[];

      // If it's a single INSERT statement, execute as one
      if (sql.trim().toUpperCase().startsWith('INSERT') && sql.split(';').length === 2) {
        statements = [sql.trim()];
      } else {
        // For complex SQL with multiple statements, we need to be careful with semicolons in strings
        // Use a more sophisticated approach to split SQL statements
        statements = this.splitSqlStatements(sql);
      }

      console.log(`Found ${statements.length} SQL statements to execute`);

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

  private splitSqlStatements(sql: string): string[] {
    const statements: string[] = [];
    let currentStatement = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < sql.length; i++) {
      const char = sql[i];
      const prevChar = i > 0 ? sql[i - 1] : '';

      // Handle string delimiters
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }

      // If we encounter a semicolon outside of a string, it's a statement separator
      if (char === ';' && !inString) {
        if (currentStatement.trim()) {
          statements.push(currentStatement.trim());
        }
        currentStatement = '';
      } else {
        currentStatement += char;
      }
    }

    // Add the last statement if there's content
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    return statements.filter(stmt => stmt.length > 0);
  }

  // Método para inserção segura
  async insertHospital(hospitalData: any): Promise<void> {
    try {
      // Validação específica para hospital
      const requiredFields = ['codigo', 'nome', 'cod_municipio', 'bairro'];
      const missingFields = requiredFields.filter(field => !hospitalData[field] || hospitalData[field] === 'undefined');

      if (missingFields.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${missingFields.join(', ')}`);
      }

      // Tratamento especial para campos específicos
      const sanitizedData = {
        codigo: hospitalData.codigo,
        nome: hospitalData.nome,
        cod_municipio: hospitalData.cod_municipio,
        bairro: hospitalData.bairro,
        especialidades: hospitalData.especialidades || null,
        leitos: hospitalData.leitos && !isNaN(hospitalData.leitos) ? Number(hospitalData.leitos) : null
      };

      const sql = SqlValidationService.buildInsertStatement('hospitais', sanitizedData);
      await this.executeSql(sql, 'insertHospital');

    } catch (error) {
      console.error('Erro ao inserir hospital:', error);
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