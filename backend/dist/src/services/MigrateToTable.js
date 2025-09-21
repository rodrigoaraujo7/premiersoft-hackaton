"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrateToTable = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
const SqlValidationService_1 = require("./SqlValidationService");
const SqlDebugHelper_1 = require("../utils/SqlDebugHelper");
// Load environment variables
dotenv.config();
class MigrateToTable {
    constructor() {
        this.client = new pg_1.Client({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });
        this.sqlDir = path.join(__dirname, '../resources/sql');
    }
    async connect() {
        try {
            await this.client.connect();
            console.log('Connected to PostgreSQL database');
        }
        catch (error) {
            console.error('Error connecting to database:', error);
            throw error;
        }
    }
    async disconnect() {
        try {
            await this.client.end();
            console.log('Disconnected from PostgreSQL database');
        }
        catch (error) {
            console.error('Error disconnecting from database:', error);
            throw error;
        }
    }
    async executeQuery(sql, params = []) {
        try {
            const result = await this.client.query(sql, params);
            return result;
        }
        catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }
    getSqlFiles() {
        try {
            if (!fs.existsSync(this.sqlDir)) {
                console.log('SQL directory does not exist:', this.sqlDir);
                return [];
            }
            const files = fs.readdirSync(this.sqlDir);
            return files.filter(file => file.endsWith('.sql'));
        }
        catch (error) {
            console.error('Error reading SQL directory:', error);
            throw error;
        }
    }
    readSqlFile(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf-8');
        }
        catch (error) {
            console.error(`Error reading SQL file ${filePath}:`, error);
            throw error;
        }
    }
    async executeSql(sql, fileName = 'unknown') {
        try {
            // Validar SQL antes de executar
            const validation = SqlValidationService_1.SqlValidationService.validateSql(sql);
            if (!validation.isValid) {
                console.error('Erros de validação SQL:', validation.errors);
                console.error('SQL problemático:', sql);
                SqlDebugHelper_1.SqlDebugHelper.analyzeSql(sql);
                throw new Error(`SQL inválido: ${validation.errors.join(', ')}`);
            }
            console.log(`Executando SQL válido de ${fileName}:`, sql);
            // Handle different types of SQL content
            let statements;
            // If it's a single INSERT statement, execute as one
            if (sql.trim().toUpperCase().startsWith('INSERT') && sql.split(';').length === 2) {
                statements = [sql.trim()];
            }
            else {
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
        }
        catch (error) {
            console.error(`Error executing SQL from ${fileName}:`, error);
            console.error('SQL that failed:', sql);
            throw error;
        }
    }
    splitSqlStatements(sql) {
        const statements = [];
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
                }
                else if (char === stringChar) {
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
            }
            else {
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
    async insertHospital(hospitalData) {
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
            const sql = SqlValidationService_1.SqlValidationService.buildInsertStatement('hospitais', sanitizedData);
            await this.executeSql(sql, 'insertHospital');
        }
        catch (error) {
            console.error('Erro ao inserir hospital:', error);
            throw error;
        }
    }
    // Método para inserção segura de médicos
    async insertMedico(medicoData) {
        try {
            // Validação específica para médico
            const requiredFields = ['codigo', 'nome_completo', 'cod_municipio'];
            const missingFields = requiredFields.filter(field => !medicoData[field] || medicoData[field] === 'undefined');
            if (missingFields.length > 0) {
                throw new Error(`Campos obrigatórios faltando: ${missingFields.join(', ')}`);
            }
            // Tratamento especial para campos específicos
            const sanitizedData = {
                codigo: medicoData.codigo,
                nome_completo: medicoData.nome_completo,
                especialidade_medico: medicoData.especialidade_medico || medicoData.especialidade || null,
                cod_municipio: medicoData.cod_municipio
            };
            const sql = SqlValidationService_1.SqlValidationService.buildInsertStatement('medicos', sanitizedData);
            await this.executeSql(sql, 'insertMedico');
        }
        catch (error) {
            console.error('Erro ao inserir médico:', error);
            throw error;
        }
    }
    deleteSqlFile(filePath) {
        try {
            fs.unlinkSync(filePath);
            console.log(`Deleted SQL file: ${filePath}`);
        }
        catch (error) {
            console.error(`Error deleting SQL file ${filePath}:`, error);
            throw error;
        }
    }
    async migrate() {
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
        }
        catch (error) {
            console.error('Migration failed:', error);
            throw error;
        }
        finally {
            await this.disconnect();
        }
    }
}
exports.MigrateToTable = MigrateToTable;
//# sourceMappingURL=MigrateToTable.js.map