"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegrasHospitais = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const MigrateToTable_1 = require("../services/MigrateToTable");
const SqlDebugHelper_1 = require("../utils/SqlDebugHelper");
class RegrasHospitais {
    constructor() {
        this.migrateService = new MigrateToTable_1.MigrateToTable();
    }
    async processar(hospitaisData) {
        try {
            // Handle different data structures from various file formats
            let dataArray;
            if (Array.isArray(hospitaisData)) {
                dataArray = hospitaisData;
            }
            else if (hospitaisData && typeof hospitaisData === 'object') {
                // Handle XML structure: { Hospitais: { Hospital: [...] } }
                if (hospitaisData.Hospitais && Array.isArray(hospitaisData.Hospitais.Hospital)) {
                    dataArray = hospitaisData.Hospitais.Hospital;
                }
                else {
                    // Single object, wrap in array
                    dataArray = [hospitaisData];
                }
            }
            else {
                throw new Error('Invalid data format: expected array or object with hospital data');
            }
            console.log(`Processando ${dataArray.length} hospitais...`);
            // Conectar ao banco de dados
            await this.migrateService.connect();
            console.log('Conectado ao banco de dados para processamento de hospitais');
            let processedCount = 0;
            let errorCount = 0;
            const errors = [];
            for (const [index, hospital] of dataArray.entries()) {
                try {
                    // Validação de dados
                    if (!this.isValidHospital(hospital)) {
                        console.warn(`Hospital ${index + 1} ignorado: dados inválidos`, hospital);
                        errorCount++;
                        continue;
                    }
                    // Sanitização
                    const sanitizedHospital = this.sanitizeHospital(hospital);
                    // Usar o método de inserção segura
                    await this.migrateService.insertHospital(sanitizedHospital);
                    processedCount++;
                    console.log(`Hospital ${index + 1}/${dataArray.length} processado: ${sanitizedHospital.nome}`);
                }
                catch (error) {
                    errorCount++;
                    const errorMsg = `Erro no hospital ${index + 1}: ${error instanceof Error ? error.message : String(error)}`;
                    console.error(errorMsg, hospital);
                    errors.push(errorMsg);
                    // Debug do SQL problemático
                    console.log('--- DEBUG DO ERRO ---');
                    SqlDebugHelper_1.SqlDebugHelper.testInsert('hospitais', hospital);
                }
            }
            console.log(`Processamento concluído: ${processedCount} sucessos, ${errorCount} erros`);
            if (errors.length > 0) {
                console.error('Resumo dos erros:', errors);
            }
        }
        catch (error) {
            console.error('Erro geral no processamento:', error);
            throw error;
        }
        finally {
            // Limpar arquivos temporários antigos da pasta resources
            try {
                await this.cleanupOldFiles();
            }
            catch (cleanupError) {
                console.warn('Erro durante limpeza de arquivos temporários:', cleanupError);
            }
            // Sempre desconectar do banco de dados
            try {
                await this.migrateService.disconnect();
                console.log('Desconectado do banco de dados');
            }
            catch (disconnectError) {
                console.error('Erro ao desconectar do banco:', disconnectError);
            }
        }
    }
    isValidHospital(hospital) {
        // Validações obrigatórias
        if (!hospital.codigo || hospital.codigo === 'undefined' || hospital.codigo === '') {
            return false;
        }
        if (!hospital.nome || hospital.nome === 'undefined') {
            return false;
        }
        // Verificar cod_municipio ou cidade
        if ((!hospital.cod_municipio && !hospital.cidade) ||
            (hospital.cod_municipio === 'undefined' && hospital.cidade === 'undefined')) {
            return false;
        }
        if (!hospital.bairro || hospital.bairro === 'undefined') {
            return false;
        }
        return true;
    }
    sanitizeHospital(hospital) {
        return {
            codigo: this.sanitizeString(hospital.codigo),
            nome: this.sanitizeString(hospital.nome),
            cod_municipio: this.sanitizeString(hospital.cod_municipio || hospital.cidade),
            bairro: this.sanitizeString(hospital.bairro),
            especialidades: this.sanitizeString(hospital.especialidades || hospital.especialidade) || null,
            leitos: this.sanitizeNumber(hospital.leitos || hospital.leitos_totais)
        };
    }
    sanitizeString(value) {
        if (!value || value === 'undefined' || value === 'null') {
            return null;
        }
        return String(value).trim();
    }
    sanitizeNumber(value) {
        if (!value || value === 'undefined' || value === 'null' || value === '') {
            return null;
        }
        const num = Number(value);
        return isNaN(num) ? null : num;
    }
    async cleanupOldFiles() {
        try {
            const resourcesDir = path_1.default.join(__dirname, '..', 'resources');
            const sqlDir = path_1.default.join(resourcesDir, 'sql');
            let cleanedCount = 0;
            // Função auxiliar para limpar arquivos em um diretório
            const cleanupDirectory = async (dirPath, dirName) => {
                try {
                    await fs_1.promises.access(dirPath);
                }
                catch {
                    console.log(`Diretório ${dirName} não encontrado, pulando limpeza`);
                    return;
                }
                const files = await fs_1.promises.readdir(dirPath);
                for (const file of files) {
                    const filePath = path_1.default.join(dirPath, file);
                    const stats = await fs_1.promises.stat(filePath);
                    // Remover apenas arquivos (não diretórios)
                    if (stats.isFile()) {
                        const ext = path_1.default.extname(file).toLowerCase();
                        // Remover arquivos .json e .sql temporários
                        if (ext === '.json' || ext === '.sql') {
                            // Verificar se é um arquivo temporário (contém timestamp no nome)
                            if (file.includes('-') && (file.includes('hospital-data') || file.includes('data-'))) {
                                try {
                                    await fs_1.promises.unlink(filePath);
                                    console.log(`Arquivo temporário removido: ${file}`);
                                    cleanedCount++;
                                }
                                catch (error) {
                                    console.warn(`Erro ao remover arquivo ${file}:`, error);
                                }
                            }
                        }
                    }
                }
            };
            // Limpar diretório resources
            await cleanupDirectory(resourcesDir, 'resources');
            // Limpar diretório resources/sql
            await cleanupDirectory(sqlDir, 'resources/sql');
            if (cleanedCount > 0) {
                console.log(`Limpeza concluída: ${cleanedCount} arquivos temporários removidos`);
            }
            else {
                console.log('Nenhum arquivo temporário encontrado para limpeza');
            }
        }
        catch (error) {
            console.warn('Erro durante limpeza de arquivos temporários:', error);
        }
    }
}
exports.RegrasHospitais = RegrasHospitais;
//# sourceMappingURL=RegrasHospitais.js.map