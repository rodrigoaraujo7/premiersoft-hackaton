"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataConverter = void 0;
const fast_xml_parser_1 = require("fast-xml-parser");
const papaparse_1 = __importDefault(require("papaparse"));
class DataConverter {
    async convertToJSON(stream, fileExtension) {
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
    streamToString(stream) {
        const chunks = [];
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            stream.on('error', (err) => reject(err));
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        });
    }
    convertXmlStreamToJSON(stream) {
        const parser = new fast_xml_parser_1.XMLParser();
        return new Promise((resolve, reject) => {
            let xml = '';
            stream.on('data', (chunk) => {
                xml += chunk.toString();
            });
            stream.on('end', () => {
                try {
                    const json = parser.parse(xml);
                    resolve(json);
                }
                catch (error) {
                    reject(error);
                }
            });
            stream.on('error', (error) => {
                reject(error);
            });
        });
    }
    convertCsvToJSON(csvContent) {
        const result = papaparse_1.default.parse(csvContent, { header: true });
        return result.data;
    }
    convertHl7ToJSON(hl7Content) {
        // This is a very basic HL7 to JSON conversion.
        // A more robust solution would require a proper HL7 parsing library.
        const segments = hl7Content.split('\n').filter(seg => seg.length > 0);
        const json = {};
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
exports.DataConverter = DataConverter;
//# sourceMappingURL=dataConverter.js.map