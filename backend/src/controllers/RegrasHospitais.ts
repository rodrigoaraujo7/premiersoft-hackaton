import { Hospital4json } from '../utils/hospital4json';

export class RegrasHospitais {
  
  /**
   * Processes patient data by validating it and writing it to a JSON file.
   */
  public async processar(data: unknown): Promise<string> {
    const hospital4json = new Hospital4json();
    var pacienteJsonPath = await hospital4json.processaHospital4Json(data);
    return pacienteJsonPath;
  }
}
