export declare class SqlValidationService {
    /**
     * Escapa aspas simples em strings SQL e fecha aspas não fechadas
     */
    static escapeString(value: string): string;
    /**
     * Valida e sanitiza dados antes de inserir
     */
    static validateAndSanitizeData(data: any): any;
    /**
     * Constrói INSERT statement seguro
     */
    static buildInsertStatement(tableName: string, data: Record<string, any>): string;
    /**
     * Valida SQL antes da execução
     */
    static validateSql(sql: string): {
        isValid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=SqlValidationService.d.ts.map