import { promises as fs } from 'fs';
import path from 'path';

export class Hospital4json {
  private readonly outputDir = path.join(__dirname, '..', 'resources');

  /**
   * Processes patient data by validating it and writing it to a JSON file.
   * @param data - The patient data object to process and save.
   * @returns The path to the generated JSON file.
   * @throws Error if data is invalid or file writing fails.
   */
  public async processaHospital4Json(data: unknown): Promise<string> {
    // Validate input data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data: Expected a non-null object.');
    }

    // Ensure output directory exists
    await fs.mkdir(this.outputDir, { recursive: true });

    // Generate unique filename (e.g., based on timestamp)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `hospital-data-${timestamp}.json`;
    const filePath = path.join(this.outputDir, fileName);

    try {
      // Write data to JSON file
      const jsonData = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, jsonData, 'utf-8');
      console.log(`Hospital data written to: ${filePath}`);
      // convert filePath (.json), in a .sql
      return filePath;
    } catch (error) {
      console.error('Error writing patient data to file:', error);
      throw new Error(`Failed to write data to file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
