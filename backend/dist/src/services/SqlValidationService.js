"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlValidationService = void 0;
// services/SqlValidationService.ts
class SqlValidationService {
    /**
     * Escapa aspas simples em strings SQL e fecha aspas não fechadas
     */
    static escapeString(value) {
        if (typeof value !== 'string')
            return String(value);
        let escaped = value.replace(/'/g, "''");
        // Fecha aspas não fechadas no final
        const singleQuoteCount = (escaped.match(/'/g) || []).length;
        if (singleQuoteCount % 2 !== 0) {
            escaped += "'";
        }
        return escaped;
    }
    /**
     * Valida e sanitiza dados antes de inserir
     */
    static validateAndSanitizeData(data) {
        const sanitized = { ...data };
        // Sanitiza campos undefined/null/vazios
        Object.keys(sanitized).forEach(key => {
            const value = sanitized[key];
            // Remove campos completamente undefined/null
            if (value === undefined || value === null) {
                delete sanitized[key];
                return;
            }
            // Converte 'undefined' e 'null' para null
            if (value === 'undefined' || value === 'null') {
                sanitized[key] = null;
                return;
            }
            // Trata strings vazias
            if (typeof value === 'string') {
                const trimmed = value.trim();
                if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') {
                    sanitized[key] = null;
                }
                else {
                    sanitized[key] = trimmed;
                }
            }
            // Trata números inválidos
            if (typeof value === 'number' && isNaN(value)) {
                sanitized[key] = null;
            }
        });
        return sanitized;
    }
    /**
     * Constrói INSERT statement seguro
     */
    static buildInsertStatement(tableName, data) {
        const sanitizedData = this.validateAndSanitizeData(data);
        if (Object.keys(sanitizedData).length === 0) {
            throw new Error('Nenhum dado válido fornecido para inserção');
        }
        const columns = Object.keys(sanitizedData);
        const values = columns.map(col => {
            const value = sanitizedData[col];
            if (typeof value === 'string') {
                return `'${this.escapeString(value)}'`;
            }
            else if (typeof value === 'number') {
                return value;
            }
            else if (value === null || value === undefined) {
                return 'NULL';
            }
            else {
                return `'${this.escapeString(String(value))}'`;
            }
        });
        return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT (codigo) DO NOTHING;`;
    }
    /**
     * Valida SQL antes da execução
     */
    static validateSql(sql) {
        const errors = [];
        // Verifica aspas não fechadas
        const singleQuoteCount = (sql.match(/'/g) || []).length;
        if (singleQuoteCount % 2 !== 0) {
            errors.push('String com aspas não fechadas detectada');
        }
        // Verifica sintaxe básica
        if (sql.includes("'undefined'") || sql.includes("undefined,")) {
            errors.push('Valores "undefined" detectados');
        }
        // Verifica vírgulas órfãs
        if (sql.includes(', )') || sql.includes(',)')) {
            errors.push('Sintaxe incorreta: vírgula antes de parêntese de fechamento');
        }
        // Verifica campos vazios no VALUES
        if (sql.includes("'',") || sql.includes(",''") || sql.includes("'';")) {
            errors.push('Campos vazios detectados - considere usar NULL');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
exports.SqlValidationService = SqlValidationService;
//# sourceMappingURL=SqlValidationService.js.map