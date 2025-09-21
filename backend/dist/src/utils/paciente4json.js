"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paciente4json = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class Paciente4json {
    constructor() {
        this.outputDir = path_1.default.join(__dirname, '..', 'resources');
    }
    /**
     * Processes patient data by validating it and writing it to a JSON file.
     * @param data - The patient data object to process and save.
     * @returns The path to the generated JSON file.
     * @throws Error if data is invalid or file writing fails.
     */
    async processaPaciente4Json(data) {
        // Validate input data
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data: Expected a non-null object.');
        }
        // Ensure output directory exists
        await fs_1.promises.mkdir(this.outputDir, { recursive: true });
        // Generate unique filename (e.g., based on timestamp)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `patient-data-${timestamp}.json`;
        const filePath = path_1.default.join(this.outputDir, fileName);
        try {
            // Write data to JSON file
            const jsonData = JSON.stringify(data, null, 2);
            await fs_1.promises.writeFile(filePath, jsonData, 'utf-8');
            console.log(`Patient data written to: ${filePath}`);
            // convert filePath (.json), in a .sql
            return filePath;
        }
        catch (error) {
            console.error('Error writing patient data to file:', error);
            throw new Error(`Failed to write data to file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.Paciente4json = Paciente4json;
//# sourceMappingURL=paciente4json.js.map