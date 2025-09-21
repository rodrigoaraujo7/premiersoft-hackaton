import { Paciente4json } from '../utils/paciente4json';

export class RegrasPacientes {
  
  /**
   * Processes patient data by validating it and writing it to a JSON file.
   */
  public async processar(data: unknown): Promise<string> {
    const paciente4json = new Paciente4json();
    var pacienteJsonPath = await paciente4json.processaPaciente4Json(data);
    return pacienteJsonPath;
  }
}
