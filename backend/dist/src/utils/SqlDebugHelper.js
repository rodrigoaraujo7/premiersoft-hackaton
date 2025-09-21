"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlDebugHelper = void 0;
// utils/SqlDebugHelper.ts
const SqlValidationService_1 = require("../services/SqlValidationService");
class SqlDebugHelper {
    /**
     * Analisa SQL problemático e identifica issues
     */
    static analyzeSql(sql) {
        console.log('=== ANÁLISE SQL ===');
        console.log('SQL Original:');
        console.log(sql);
        console.log('');
        // Verifica aspas
        const singleQuotes = (sql.match(/'/g) || []).length;
        console.log(`Número de aspas simples: ${singleQuotes} (${singleQuotes % 2 === 0 ? 'Par ✓' : 'Ímpar ✗'})`);
        // Encontra strings não fechadas
        let inString = false;
        let position = 0;
        for (const char of sql) {
            if (char === "'") {
                inString = !inString;
                if (inString) {
                    console.log(`String iniciada na posição ${position}`);
                }
                else {
                    console.log(`String fechada na posição ${position}`);
                }
            }
            position++;
        }
        if (inString) {
            console.log('❌ String não fechada detectada!');
        }
        // Verifica valores undefined
        if (sql.includes('undefined')) {
            console.log('❌ Valores "undefined" encontrados!');
            const matches = sql.match(/'undefined'/g);
            console.log(`Ocorrências de 'undefined': ${matches ? matches.length : 0}`);
        }
        // Verifica campos vazios
        if (sql.includes("''")) {
            console.log('⚠️ Campos vazios detectados - considere usar NULL');
        }
        // Verifica sintaxe
        if (sql.includes(', )') || sql.includes(',)')) {
            console.log('❌ Vírgula órfã detectada!');
        }
        console.log('================');
    }
    /**
     * Testa um INSERT específico
     */
    static testInsert(tableName, data) {
        try {
            console.log('=== TESTE INSERT ===');
            console.log('Dados originais:', data);
            const sanitized = SqlValidationService_1.SqlValidationService.validateAndSanitizeData(data);
            console.log('Dados sanitizados:', sanitized);
            const sql = SqlValidationService_1.SqlValidationService.buildInsertStatement(tableName, sanitized);
            console.log('SQL gerado:', sql);
            const validation = SqlValidationService_1.SqlValidationService.validateSql(sql);
            console.log('Validação:', validation);
            if (validation.isValid) {
                console.log('✅ SQL válido!');
            }
            else {
                console.log('❌ SQL inválido:', validation.errors);
            }
        }
        catch (error) {
            console.log('❌ Erro ao gerar SQL:', error instanceof Error ? error.message : String(error));
        }
        console.log('==================');
    }
}
exports.SqlDebugHelper = SqlDebugHelper;
//# sourceMappingURL=SqlDebugHelper.js.map