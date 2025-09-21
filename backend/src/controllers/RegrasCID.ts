import { MigrateToTable } from '../services/MigrateToTable';

export class RegrasCID {
  private migrateService: MigrateToTable;

  constructor() {
    this.migrateService = new MigrateToTable();
  }

  async getAll(): Promise<any[]> {
    try {
      await this.migrateService.connect();
      const data = await this.migrateService.getAllCID();
      return data;
    } catch (error) {
      console.error('Erro ao obter CID:', error);
      throw error;
    } finally {
      await this.migrateService.disconnect();
    }
  }
}