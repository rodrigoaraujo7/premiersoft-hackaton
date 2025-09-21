import * as path from 'path';
import { DataConverter } from '../dataConverter';
import { RegrasMedicos } from '../../controllers/RegrasMedicos';
import { MultipartFile } from '@fastify/multipart';

export class MedicoUploadService {
  private allowedFormats = ['.xlsx', '.xml', '.json', '.hl7', '.fhir', '.csv'];
  private dataConverter = new DataConverter();
  private regrasMedicos = new RegrasMedicos();

  public async upload(data: MultipartFile): Promise<string> {
    const fileExtension = path.extname(data.filename).toLowerCase();

    if (!this.allowedFormats.includes(fileExtension)) {
      throw new Error(`Formato de arquivo invalido, só são aceitos os formatos: ${this.allowedFormats.join(', ')}`);
    }

    const jsonData = await this.dataConverter.convertToJSON(data.file, fileExtension);
    console.log('Se liga no JSON: ', jsonData);

    // Processar os dados dos médicos
    await this.regrasMedicos.processar(jsonData);

    return 'Upload e processamento de médicos concluído com sucesso';
  }
}
