import { Hospital4json } from '../utils/hospital4json';
import { promises as fs } from 'fs';
import path from 'path';
import { MigrateToTable } from '../services/MigrateToTable';
import { SqlValidationService } from '../services/SqlValidationService';
import { SqlDebugHelper } from '../utils/SqlDebugHelper';

export class RegrasHospitais {
  private migrateService: MigrateToTable;

  constructor() {
    this.migrateService = new MigrateToTable();
  }

  async processar(hospitaisData: any[]): Promise<void> {
    try {
      console.log(`Processando ${hospitaisData.length} hospitais...`);

      // Conectar ao banco de dados
      await this.migrateService.connect();
      console.log('Conectado ao banco de dados para processamento de hospitais');

      let processedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const [index, hospital] of hospitaisData.entries()) {
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

          console.log(`Hospital ${index + 1}/${hospitaisData.length} processado: ${sanitizedHospital.nome}`);

        } catch (error) {
          errorCount++;
          const errorMsg = `Erro no hospital ${index + 1}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(errorMsg, hospital);
          errors.push(errorMsg);

          // Debug do SQL problemático
          console.log('--- DEBUG DO ERRO ---');
          SqlDebugHelper.testInsert('hospitais', hospital);
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

  private isValidHospital(hospital: any): boolean {
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

  private sanitizeHospital(hospital: any): any {
    return {
      codigo: this.sanitizeString(hospital.codigo),
      nome: this.sanitizeString(hospital.nome),
      cod_municipio: this.sanitizeString(hospital.cod_municipio || hospital.cidade),
      bairro: this.sanitizeString(hospital.bairro),
      especialidades: this.sanitizeString(hospital.especialidades || hospital.especialidade) || null,
      leitos: this.sanitizeNumber(hospital.leitos || hospital.leitos_totais)
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
              if (file.includes('-') && (file.includes('hospital-data') || file.includes('data-'))) {
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
