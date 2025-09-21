import { Hospital4json } from '../utils/hospital4json';
import { promises as fs } from 'fs';
import path from 'path';
import { MigrateToTable } from '../services/MigrateToTable';

export class RegrasHospitais {
  
  /**
   * Processes patient data by validating it and writing it to a JSON file.
   */
  public async processar(data: unknown): Promise<string> {
    const hospital4json = new Hospital4json();
    const hospitalJsonPath = await hospital4json.processaHospital4Json(data);

    // Read the JSON file
    const jsonData = await fs.readFile(hospitalJsonPath, 'utf-8');
    const hospitals = JSON.parse(jsonData);

    // Generate SQL
    let sql = `-- Criação da tabela hospitais
    CREATE TABLE IF NOT EXISTS hospitais (
      codigo UUID PRIMARY KEY,
      nome TEXT,
      cod_municipio UUID,
      bairro TEXT,
      especialidades TEXT,
      leitos INT,
      FOREIGN KEY (cod_municipio) REFERENCES municipios(codigo_ibge)
    );`;

    // Assuming hospitals is an array of objects
    if (Array.isArray(hospitals)) {
      for (const hospital of hospitals) {
        const values = [
          `'${hospital.codigo}'`,
          `'${hospital.nome}'`,
          `'${hospital.cod_municipio || hospital.cidade}'`,
          `'${hospital.bairro}'`,
          `'${hospital.especialidades || hospital.especialidade}'`,
          hospital.leitos || hospital.leitos_totais
        ];
        sql += `INSERT INTO hospitais (codigo, nome, cod_municipio, bairro, especialidades, leitos) VALUES (${values.join(', ')}) ON CONFLICT (codigo) DO NOTHING;\n`;
      }
    }

    // Write SQL to file
    const sqlDir = path.join(__dirname, '..', 'resources', 'sql');
    await fs.mkdir(sqlDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sqlFilePath = path.join(sqlDir, `hospital-data-${timestamp}.sql`);
    await fs.writeFile(sqlFilePath, sql, 'utf-8');

    // Execute SQL
    const migrator = new MigrateToTable();
    await migrator.migrate();

    return hospitalJsonPath;
  }
}
