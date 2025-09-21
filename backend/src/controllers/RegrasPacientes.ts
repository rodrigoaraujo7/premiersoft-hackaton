import { promises as fs } from 'fs';
import path from 'path';
import { MigrateToTable } from '../services/MigrateToTable';
import { SqlValidationService } from '../services/SqlValidationService';
import { SqlDebugHelper } from '../utils/SqlDebugHelper';

export class RegrasPacientes {
  private migrateService: MigrateToTable;

  constructor() {
    this.migrateService = new MigrateToTable();
  }

  async processar(pacientesData: any): Promise<void> {
    try {
      // Handle different data structures from various file formats
      let dataArray: any[];

      if (Array.isArray(pacientesData)) {
        dataArray = pacientesData;
      } else if (pacientesData && typeof pacientesData === 'object') {
        // Handle XML structure: { Pacientes: { Paciente: [...] } }
        if (pacientesData.Pacientes && Array.isArray(pacientesData.Pacientes.Paciente)) {
          dataArray = pacientesData.Pacientes.Paciente;
        } else {
          // Single object, wrap in array
          dataArray = [pacientesData];
        }
      } else {
        throw new Error('Invalid data format: expected array or object with patient data');
      }

      console.log(`Processando ${dataArray.length} pacientes...`);

      // Conectar ao banco de dados
      await this.migrateService.connect();
      console.log('Conectado ao banco de dados para processamento de pacientes');

      let processedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const [index, paciente] of dataArray.entries()) {
        try {
          // Validação de dados
          if (!this.isValidPaciente(paciente)) {
            console.warn(`Paciente ${index + 1} ignorado: dados inválidos`, paciente);
            errorCount++;
            continue;
          }

          // Sanitização
          const sanitizedPaciente = this.sanitizePaciente(paciente);

          // Usar o método de inserção segura
          await this.migrateService.insertPaciente(sanitizedPaciente);
          processedCount++;

          console.log(`Paciente ${index + 1}/${pacientesData.length} processado: ${sanitizedPaciente.nome_completo}`);

        } catch (error) {
          errorCount++;
          const errorMsg = `Erro no paciente ${index + 1}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(errorMsg, paciente);
          errors.push(errorMsg);

          // Debug do SQL problemático
          console.log('--- DEBUG DO ERRO ---');
          SqlDebugHelper.testInsert('pacientes', paciente);
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

  private isValidPaciente(paciente: any): boolean {
    // Validações obrigatórias - handle both lowercase and capitalized field names
    const codigo = paciente.id || paciente.codigo || paciente.Codigo;
    if (!codigo || codigo === 'undefined' || codigo === '') {
      return false;
    }

    const nomeCompleto = paciente.nome_completo || paciente.Nome_Completo;
    if (!nomeCompleto || nomeCompleto === 'undefined') {
      return false;
    }

    // Verificar cod_municipio ou cidade
    const codMunicipio = paciente.cod_municipio || paciente.cidade || paciente.Cod_municipio;
    if (!codMunicipio || codMunicipio === 'undefined') {
      return false;
    }

    return true;
  }

  private sanitizePaciente(paciente: any): any {
    return {
      codigo: this.sanitizeString(paciente.id || paciente.codigo || paciente.Codigo),
      cpf: this.sanitizeString(paciente.cpf || paciente.CPF),
      nome_completo: this.sanitizeString(paciente.nome_completo || paciente.Nome_Completo),
      genero: this.sanitizeString(paciente.genero || paciente.Genero),
      cod_municipio: this.sanitizeString(paciente.cod_municipio || paciente.cidade || paciente.Cod_municipio),
      bairro: this.sanitizeString(paciente.bairro || paciente.Bairro),
      convenio: this.sanitizeString(paciente.convenio || paciente.Convenio),
      cid: this.sanitizeString(paciente.cid || paciente['CID-10'])
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
              if (file.includes('-') && (file.includes('patient-data') || file.includes('paciente-data') || file.includes('data-'))) {
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
