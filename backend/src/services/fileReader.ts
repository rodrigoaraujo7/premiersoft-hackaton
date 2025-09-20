import * as fs from 'fs';
import * as path from 'path';

export interface FileData {
  filename: string;
  content: any;
}

export async function readAllFiles(): Promise<FileData[]> {
  const resourcesDir = path.join(__dirname, '../../resources');

  if (!fs.existsSync(resourcesDir)) {
    throw new Error(`Resources directory not found: ${resourcesDir}`);
  }

  const files = fs.readdirSync(resourcesDir);
  const results: FileData[] = [];

  for (const file of files) {
    const filePath = path.join(resourcesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    let parsedContent: any = content;

    if (file.endsWith('.json') || file.endsWith('.fhir.json')) {
      try {
        parsedContent = JSON.parse(content);
      } catch (error) {
        console.warn(`Failed to parse JSON in ${file}:`, error);
        // Keep as string if parsing fails
      }
    }
    // For .csv, .xml, .hl7, keep as string

    results.push({ filename: file, content: parsedContent });
  }

  return results;
}