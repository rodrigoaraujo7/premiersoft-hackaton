import { promises as fs } from 'fs';
import path from 'path';
import { MigrateToTable } from '../services/MigrateToTable';
import { SqlValidationService } from '../services/SqlValidationService';
import { SqlDebugHelper } from '../utils/SqlDebugHelper';

export class RegrasMedicos {
  private migrateService: MigrateToTable;

  constructor() {
    this.migrateService = new MigrateToTable();
  }

  async processar(medicosData: any): Promise<void> {
    try {
      // Handle different data structures from various file formats
      let dataArray: any[];

      if (Array.isArray(medicosData)) {
        dataArray = medicosData;
      } else if (medicosData && typeof medicosData === 'object') {
        // Handle XML structure: { Medicos: { Medico: [...] } }
        if (medicosData.Medicos && Array.isArray(medicosData.Medicos.Medico)) {
          dataArray = medicosData.Medicos.Medico;
        } else {
          // Single object, wrap in array
          dataArray = [medicosData];
        }
      } else {
        throw new Error('Invalid data format: expected array or object with medico data');
      }

      console.log(`Processando ${dataArray.length} médicos...`);

      // Conectar ao banco de dados
      await this.migrateService.connect();
      console.log('Conectado ao banco de dados para processamento de médicos');

      let processedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const [index, medico] of dataArray.entries()) {
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

          console.log(`Médico ${index + 1}/${dataArray.length} processado: ${sanitizedMedico.nome_completo}`);

        } catch (error) {
          errorCount++;
          const errorMsg = `Erro no médico ${index + 1}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(errorMsg, medico);
          errors.push(errorMsg);

          // Debug do SQL problemático
          console.log('--- DEBUG DO ERRO ---');
          SqlDebugHelper.testInsert('medicos', medico);
        }
      }

      console.log(`Processamento concluído: ${processedCount} sucessos, ${errorCount} erros`);

      if (errors.length > 0) {
        console.error('Resumo dos erros:', errors);
      }

    } catch (error) {
      console.error('Erro geral no processamento:', error);
      throw error;
    } finally {
      // Limpar arquivos temporários antigos da pasta resources
      try {
        await this.cleanupOldFiles();
      } catch (cleanupError) {
        console.warn('Erro durante limpeza de arquivos temporários:', cleanupError);
      }

      // Sempre desconectar do banco de dados
      try {
        await this.migrateService.disconnect();
        console.log('Desconectado do banco de dados');
      } catch (disconnectError) {
        console.error('Erro ao desconectar do banco:', disconnectError);
      }
    }
  }

  private isValidMedico(medico: any): boolean {
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

  private sanitizeMedico(medico: any): any {
    return {
      codigo: this.sanitizeString(medico.id || medico.codigo),
      nome_completo: this.sanitizeString(medico.nome_completo),
      especialidade_medico: this.sanitizeString(medico.especialidade) || null,
      cod_municipio: this.sanitizeString(medico.cod_municipio || medico.cidade)
    };
  }

  private sanitizeString(value: any): string | null {
    if (!value || value === 'undefined' || value === 'null') {
      return null;
    }

    return String(value).trim();
  }

  private sanitizeNumber(value: any): number | null {
    if (!value || value === 'undefined' || value === 'null' || value === '') {
      return null;
    }

    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  private async cleanupOldFiles(): Promise<void> {
    try {
      const resourcesDir = path.join(__dirname, '..', 'resources');
      const sqlDir = path.join(resourcesDir, 'sql');
      let cleanedCount = 0;

      // Função auxiliar para limpar arquivos em um diretório
      const cleanupDirectory = async (dirPath: string, dirName: string): Promise<void> => {
        try {
          await fs.access(dirPath);
        } catch {
          console.log(`Diretório ${dirName} não encontrado, pulando limpeza`);
          return;
        }

        const files = await fs.readdir(dirPath);

        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stats = await fs.stat(filePath);

          // Remover apenas arquivos (não diretórios)
          if (stats.isFile()) {
            const ext = path.extname(file).toLowerCase();

            // Remover arquivos .json e .sql temporários
            if (ext === '.json' || ext === '.sql') {
              // Verificar se é um arquivo temporário (contém timestamp no nome)
              if (file.includes('-') && (file.includes('medico-data') || file.includes('data-'))) {
                try {
                  await fs.unlink(filePath);
                  console.log(`Arquivo temporário removido: ${file}`);
                  cleanedCount++;
                } catch (error) {
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
      } else {
        console.log('Nenhum arquivo temporário encontrado para limpeza');
      }

    } catch (error) {
      console.warn('Erro durante limpeza de arquivos temporários:', error);
    }
  }
}
