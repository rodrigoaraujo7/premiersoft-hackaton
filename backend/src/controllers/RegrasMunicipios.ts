import { MigrateToTable } from '../services/MigrateToTable';

export class RegrasMunicipios {
  private migrateService: MigrateToTable;

  constructor() {
    this.migrateService = new MigrateToTable();
  }

  async getAll(): Promise<any[]> {
    try {
      await this.migrateService.connect();
      const data = await this.migrateService.getAllMunicipios();
      return data;
    } catch (error) {
      console.error('Erro ao obter municipios:', error);
      throw error;
    } finally {
      await this.migrateService.disconnect();
    }
  }
}