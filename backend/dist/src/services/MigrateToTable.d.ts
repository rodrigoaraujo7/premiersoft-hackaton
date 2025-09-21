export declare class MigrateToTable {
    private client;
    private sqlDir;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    executeQuery(sql: string, params?: any[]): Promise<any>;
    private getSqlFiles;
    private readSqlFile;
    private executeSql;
    private splitSqlStatements;
    insertHospital(hospitalData: any): Promise<void>;
    insertMedico(medicoData: any): Promise<void>;
    insertPaciente(pacienteData: any): Promise<void>;
    private deleteSqlFile;
    migrate(): Promise<void>;
}
//# sourceMappingURL=MigrateToTable.d.ts.map