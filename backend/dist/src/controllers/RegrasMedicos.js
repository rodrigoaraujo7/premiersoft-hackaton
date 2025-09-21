"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegrasMedicos = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const MigrateToTable_1 = require("../services/MigrateToTable");
const SqlDebugHelper_1 = require("../utils/SqlDebugHelper");
class RegrasMedicos {
    constructor() {
        this.migrateService = new MigrateToTable_1.MigrateToTable();
    }
    async processar(medicosData) {
        try {
            console.log(`Processando ${medicosData.length} médicos...`);
            // Conectar ao banco de dados
            await this.migrateService.connect();
            console.log('Conectado ao banco de dados para processamento de médicos');
            let processedCount = 0;
            let errorCount = 0;
            const errors = [];
            for (const [index, medico] of medicosData.entries()) {
                try {
                    // Validação de dados
                    if (!this.isValidMedico(medico)) {
                        console.warn(`Médico ${index + 1} ignorado: dados inválidos`, medico);
                        errorCount++;
                        continue;
                    }
                    // Sanitização
                    const sanitizedMedico = this.sanitizeMedico(medico);
                    // Usar o método de inserção segura
                    await this.migrateService.insertMedico(sanitizedMedico);
                    processedCount++;
                    console.log(`Médico ${index + 1}/${medicosData.length} processado: ${sanitizedMedico.nome_completo}`);
                }
                catch (error) {
                    errorCount++;
                    const errorMsg = `Erro no médico ${index + 1}: ${error instanceof Error ? error.message : String(error)}`;
                    console.error(errorMsg, medico);
                    errors.push(errorMsg);
                    // Debug do SQL problemático
                    console.log('--- DEBUG DO ERRO ---');
                    SqlDebugHelper_1.SqlDebugHelper.testInsert('medicos', medico);
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
    isValidMedico(medico) {
        // Validações obrigatórias
        if (!medico.id && !medico.codigo || (medico.id === 'undefined' && medico.codigo === 'undefined') || (!medico.id && medico.codigo === '')) {
            return false;
        }
        if (!medico.nome_completo || medico.nome_completo === 'undefined') {
            return false;
        }
        // Verificar cod_municipio ou cidade
        if ((!medico.cod_municipio && !medico.cidade) ||
            (medico.cod_municipio === 'undefined' && medico.cidade === 'undefined')) {
            return false;
        }
        return true;
    }
    sanitizeMedico(medico) {
        return {
            codigo: this.sanitizeString(medico.id || medico.codigo),
            nome_completo: this.sanitizeString(medico.nome_completo),
            especialidade_medico: this.sanitizeString(medico.especialidade) || null,
            cod_municipio: this.sanitizeString(medico.cod_municipio || medico.cidade)
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
                            if (file.includes('-') && (file.includes('medico-data') || file.includes('data-'))) {
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
exports.RegrasMedicos = RegrasMedicos;
//# sourceMappingURL=RegrasMedicos.js.map