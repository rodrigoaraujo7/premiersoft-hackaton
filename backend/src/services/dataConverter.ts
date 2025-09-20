import { Readable } from 'stream';
import { XMLParser } from 'fast-xml-parser';
import Papa from 'papaparse';

export class DataConverter {
  public async convertToJSON(stream: Readable, fileExtension: string): Promise<any> {
    switch (fileExtension) {
      case '.json':
      case '.fhir':
        const jsonContent = await this.streamToString(stream);
        return JSON.parse(jsonContent);
      case '.xml':
        return this.convertXmlStreamToJSON(stream);
      case '.csv':
      case '.xlsx': // Assuming xlsx is in csv format
        const csvContent = await this.streamToString(stream);
        return this.convertCsvToJSON(csvContent);
      case '.hl7':
        const hl7Content = await this.streamToString(stream);
        return this.convertHl7ToJSON(hl7Content);
      default:
        throw new Error('Unsupported file format');
    }
  }

  private streamToString(stream: Readable): Promise<string> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
  }

  private convertXmlStreamToJSON(stream: Readable): Promise<any> {
    const parser = new XMLParser();
    return new Promise((resolve, reject) => {
      let xml = '';
      stream.on('data', (chunk) => {
        xml += chunk.toString();
      });
      stream.on('end', () => {
        try {
          const json = parser.parse(xml);
          resolve(json);
        } catch (error) {
          reject(error);
        }
      });
      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  private convertCsvToJSON(csvContent: string): any {
    const result = Papa.parse(csvContent, { header: true });
    return result.data;
  }

  private convertHl7ToJSON(hl7Content: string): any {
    // This is a very basic HL7 to JSON conversion.
    // A more robust solution would require a proper HL7 parsing library.
    const segments = hl7Content.split('\n').filter(seg => seg.length > 0);
    const json: { [key: string]: any } = {};
    segments.forEach((segment, index) => {
      const fields = segment.split('|');
      const segmentName = fields[0];
      if (!json[segmentName]) {
        json[segmentName] = [];
      }
      json[segmentName].push(fields.slice(1));
    });
    return json;
  }
}
