import * as path from 'path';
import { DataConverter } from '../dataConverter';
import { RegrasHospitais } from '../../controllers/RegrasHospitais';
import { MultipartFile } from '@fastify/multipart';

export class HospitalUploadService {
  private allowedFormats = ['.xlsx', '.xml', '.json', '.hl7', '.fhir', '.csv'];
  private dataConverter = new DataConverter();
  private regrasHospitais = new RegrasHospitais();

  public async upload(data: MultipartFile): Promise<string> {
    const fileExtension = path.extname(data.filename).toLowerCase();

    if (!this.allowedFormats.includes(fileExtension)) {
      throw new Error(`Formato de arquivo invalido, só são aceitos os formatos: ${this.allowedFormats.join(', ')}`);
    }

    const jsonData = await this.dataConverter.convertToJSON(data.file, fileExtension);
    const result = await this.regrasHospitais.processar(jsonData);
    console.log('Se liga no JSON: ', jsonData);

    return result;
  }
}
