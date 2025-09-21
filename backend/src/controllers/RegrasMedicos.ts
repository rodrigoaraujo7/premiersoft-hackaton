import { Medico4json } from '../utils/medico4json';

export class RegrasMedicos {
  
  /**
   * Processes patient data by validating it and writing it to a JSON file.
   */
  public async processar(data: unknown): Promise<string> {
    const medico4json = new Medico4json();
    var medicoJsonPath = await medico4json.processaMedico4Json(data);
    return medicoJsonPath;
  }
}
