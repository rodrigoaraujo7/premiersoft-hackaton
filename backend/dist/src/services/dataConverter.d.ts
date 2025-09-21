import { Readable } from 'stream';
export declare class DataConverter {
    convertToJSON(stream: Readable, fileExtension: string): Promise<any>;
    private streamToString;
    private convertXmlStreamToJSON;
    private convertCsvToJSON;
    private convertHl7ToJSON;
}
//# sourceMappingURL=dataConverter.d.ts.map