"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.readAllFiles = readAllFiles;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function readAllFiles() {
    const resourcesDir = path.join(__dirname, '../resources');
    if (!fs.existsSync(resourcesDir)) {
        throw new Error(`Resources directory not found: ${resourcesDir}`);
    }
    const files = fs.readdirSync(resourcesDir);
    const results = [];
    for (const file of files) {
        const filePath = path.join(resourcesDir, file);
        if (!fs.statSync(filePath).isFile())
            continue;
        const content = fs.readFileSync(filePath, 'utf-8');
        let parsedContent = content;
        if (file.endsWith('.json') || file.endsWith('.fhir.json')) {
            try {
                parsedContent = JSON.parse(content);
            }
            catch (error) {
                console.warn(`Failed to parse JSON in ${file}:`, error);
                // Keep as string if parsing fails
            }
        }
        // For .csv, .xml, .hl7, keep as string
        results.push({ filename: file, content: parsedContent });
    }
    return results;
}
//# sourceMappingURL=fileReader.js.map