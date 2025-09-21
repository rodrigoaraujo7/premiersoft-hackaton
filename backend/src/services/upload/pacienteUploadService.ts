import * as path from 'path';
import { DataConverter } from '../dataConverter';
import { RegrasPacientes } from '../../controllers/RegrasPacientes';
import { MultipartFile } from '@fastify/multipart';

export class PatientUploadService {
  private allowedFormats = ['.xlsx', '.xml', '.json', '.hl7', '.fhir', '.csv'];
  private dataConverter = new DataConverter();
  private regrasPacientes = new RegrasPacientes();

  public async upload(data: MultipartFile): Promise<string> {
    const fileExtension = path.extname(data.filename).toLowerCase();

    if (!this.allowedFormats.includes(fileExtension)) {
      throw new Error(`Formato de arquivo invalido, só são aceitos os formatos: ${this.allowedFormats.join(', ')}`);
    }

    const jsonData = await this.dataConverter.convertToJSON(data.file, fileExtension);

    // Processar os dados dos pacientes
    await this.regrasPacientes.processar(jsonData);

    return 'Upload e processamento de pacientes concluído com sucesso';
  }
}
