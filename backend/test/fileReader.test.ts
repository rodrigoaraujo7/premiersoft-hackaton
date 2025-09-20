import { readAllFiles } from '../src/services/fileReader';
import * as fs from 'fs';

jest.mock('fs');

describe('readAllFiles', () => {
  it('should read and parse all files in the resources directory', async () => {
    const mockFiles = [
      'sample.json',
      'sample.csv',
      'sample.xml',
      'sample.hl7',
      'sample.fhir.json',
    ];

    const mockFileContents: { [key: string]: string } = {
      'sample.json': '{"key": "value"}',
      'sample.csv': 'col1,col2\nval1,val2',
      'sample.xml': '<root><element>some value</element></root>',
      'sample.hl7': 'MSH|^~\\&|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|202301011200||ADT^A01|MSG00001|P|2.3\nEVN|A01|202301011200\nPID|1||PATIENT_ID^^^MRN||\n',
      'sample.fhir.json': '{\n        "resourceType": "Patient",\n        "id": "example",\n        "name": [\n          {\n            "use": "official",\n            "family": "Chalmers",\n            "given": [\n              "Peter",\n              "James"\n            ]\n          }\n        ]\n      }',
    };

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue(mockFiles);
    (fs.readFileSync as jest.Mock).mockImplementation((filePath: string) => {
      const fileName = Object.keys(mockFileContents).find(key => filePath.includes(key));
      return fileName ? mockFileContents[fileName] : '';
    });

    const result = await readAllFiles();

    expect(result).toHaveLength(5);

    expect(result.find(f => f.filename === 'sample.json')!.content).toEqual({ key: 'value' });
    expect(result.find(f => f.filename === 'sample.csv')!.content).toBe('col1,col2\nval1,val2');
    expect(result.find(f => f.filename === 'sample.xml')!.content).toBe('<root><element>some value</element></root>');
    expect(result.find(f => f.filename === 'sample.hl7')!.content).toBe('MSH|^~\\&|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|202301011200||ADT^A01|MSG00001|P|2.3\nEVN|A01|202301011200\nPID|1||PATIENT_ID^^^MRN||\n');
    expect(result.find(f => f.filename === 'sample.fhir.json')!.content).toEqual(JSON.parse(mockFileContents['sample.fhir.json']));
  });
});
