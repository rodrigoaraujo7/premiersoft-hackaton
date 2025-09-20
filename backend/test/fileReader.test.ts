import { readAllFiles } from '../src/services/fileReader';

describe('readAllFiles with real data', () => {
  it('should read and parse all files in the resources/test directory', async () => {
    const result = await readAllFiles();

    expect(result).toHaveLength(5);

    expect(result.find(f => f.filename === 'sample.json')!.content).toEqual({ key: 'value' });
    expect(result.find(f => f.filename === 'sample.csv')!.content).toBe('col1,col2\nval1,val2');
    expect(result.find(f => f.filename === 'sample.xml')!.content).toBe('<root><element>some value</element></root>');
    expect(result.find(f => f.filename === 'sample.hl7')!.content).toBe('MSH|^~\\&|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|202301011200||ADT^A01|MSG00001|P|2.3\nEVN|A01|202301011200\nPID|1||PATIENT_ID^^^MRN||\n');
    expect(result.find(f => f.filename === 'sample.fhir.json')!.content).toEqual({
      "resourceType": "Patient",
      "id": "example",
      "name": [
        {
          "use": "official",
          "family": "Chalmers",
          "given": [
            "Peter",
            "James"
          ]
        }
      ]
    });
  });
});