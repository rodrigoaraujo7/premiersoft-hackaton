import { MigrateToTable } from '../services/MigrateToTable';

export class RegrasEstados {
  private migrateService: MigrateToTable;

  constructor() {
    this.migrateService = new MigrateToTable();
  }

  async getAll(): Promise<any[]> {
    try {
      await this.migrateService.connect();
      const data = await this.migrateService.getAllEstados();
      return data;
    } catch (error) {
      console.error('Erro ao obter estados:', error);
      throw error;
    } finally {
      await this.migrateService.disconnect();
    }
  }
}