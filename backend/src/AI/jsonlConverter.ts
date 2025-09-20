import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime';

/**
 * Configuration interface for the JSONL Converter
 */
export interface ConverterConfig {
  apiKey?: string;
  model?: string;
  outputDir?: string;
  thinkingBudget?: number;
}

/**
 * Supported input types for conversion
 */
export type InputType = 
  | 'text'
  | 'json'
  | 'csv'
  | 'xml'
  | 'yaml'
  | 'excel'
  | 'pdf'
  | 'image'
  | 'url'
  | 'file'
  | 'data';

/**
 * Conversion options
 */
export interface ConversionOptions {
  inputType?: InputType;
  customPrompt?: string;
  preserveStructure?: boolean;
  flattenNested?: boolean;
  includeMetadata?: boolean;
}

/**
 * Conversion result
 */
export interface ConversionResult {
  success: boolean;
  outputFile?: string;
  records?: number;
  error?: string;
  metadata?: any;
}

/**
 * Agentic JSONL Converter using Gemini with Code Interpreter
 * Converts ANY data format to JSONL using AI-powered analysis and conversion
 */
export class JSONLConverter {
  private ai: GoogleGenAI;
  private model: string;
  private outputDir: string;
  private thinkingBudget: number;

  constructor(config: ConverterConfig = {}) {
    this.ai = new GoogleGenAI({
      apiKey: config.apiKey || process.env.GEMINI_API_KEY || '',
    });
    this.model = config.model || 'gemini-2.5-flash';
    this.outputDir = config.outputDir || path.join(__dirname, 'Output');
    this.thinkingBudget = config.thinkingBudget || 0;

    // Ensure output directory exists
    this.ensureOutputDirectory();
  }

  /**
   * Ensure the output directory exists
   */
  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate a filename based on input and timestamp
   */
  private generateFilename(input: string | Buffer, inputType?: InputType): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const hash = this.simpleHash(input.toString().substring(0, 100));
    const extension = inputType ? `.${inputType}` : '';
    return `converted_${timestamp}_${hash}${extension}.jsonl`;
  }

  /**
   * Simple hash function for filename generation
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Detect input type based on content
   */
  private detectInputType(input: string | Buffer): InputType {
    const content = input.toString();
    
    // Try to parse as JSON
    try {
      JSON.parse(content);
      return 'json';
    } catch {}

    // Check for CSV-like structure
    if (content.includes(',') && content.includes('\n')) {
      const lines = content.split('\n');
      if (lines.length > 1 && lines[0].split(',').length > 1) {
        return 'csv';
      }
    }

    // Check for XML
    if (content.trim().startsWith('<') && content.includes('>')) {
      return 'xml';
    }

    // Check for YAML
    if (content.includes('---') || content.includes(':') && content.includes('\n')) {
      return 'yaml';
    }

    // Check if it's a URL
    try {
      new URL(content.trim());
      return 'url';
    } catch {}

    // Default to text
    return 'text';
  }

  /**
   * Create a comprehensive prompt for the AI to convert data to JSONL
   */
  private createConversionPrompt(
    input: string | Buffer,
    inputType: InputType,
    options: ConversionOptions = {}
  ): string {
    const content = input.toString();
    const preserveStructure = options.preserveStructure ? 'yes' : 'no';
    const flattenNested = options.flattenNested ? 'yes' : 'no';
    const includeMetadata = options.includeMetadata ? 'yes' : 'no';

    let basePrompt = `
You are an expert data converter. Your task is to convert the following input data into JSONL (JSON Lines) format.

INPUT DATA:
${content}

CONVERSION REQUIREMENTS:
1. Output MUST be in JSONL format (one JSON object per line)
2. Each line should be a valid JSON object
3. Preserve structure: ${preserveStructure}
4. Flatten nested objects: ${flattenNested}
5. Include metadata: ${includeMetadata}
6. Input type detected: ${inputType}

CONVERSION RULES:
- Analyze the input data structure carefully
- Create meaningful field names for the JSON objects
- If the data has multiple records, create one JSON object per record
- If the data is hierarchical, decide whether to flatten or preserve structure
- Add metadata fields if requested (like _source, _type, _timestamp)
- Ensure all JSON objects are valid and properly formatted
- Handle arrays by creating separate records for each item when appropriate

OUTPUT FORMAT:
- Pure JSONL format only
- No explanations or additional text
- One JSON object per line
- Each line should be valid JSON

${options.customPrompt ? `ADDITIONAL REQUIREMENTS: ${options.customPrompt}` : ''}

Convert the data now:`;

    return basePrompt;
  }

  /**
   * Convert data to JSONL using Gemini with Code Interpreter
   */
  async convertToJSONL(
    input: string | Buffer | object,
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    try {
      // Convert input to string if it's an object
      let inputString: string;
      if (typeof input === 'object' && !Buffer.isBuffer(input)) {
        inputString = JSON.stringify(input);
        options.inputType = 'json';
      } else {
        inputString = input.toString();
      }

      // Auto-detect input type if not specified
      const inputType = options.inputType || this.detectInputType(inputString);

      // Create the conversion prompt
      const prompt = this.createConversionPrompt(inputString, inputType, options);

      // Configure Gemini with code execution tools
      const tools = [
        { codeExecution: {} },
        {
          googleSearch: {}
        }
      ];

      const config = {
        thinkingConfig: {
          thinkingBudget: this.thinkingBudget,
        },
        tools,
      };

      const contents = [
        {
          role: 'user',
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ];

      console.log('🤖 Starting conversion with Gemini...');
      console.log(`📊 Input type: ${inputType}`);
      console.log(`📁 Output directory: ${this.outputDir}`);

      // Generate content with streaming
      const response = await this.ai.models.generateContentStream({
        model: this.model,
        config,
        contents,
      });

      let jsonlContent = '';
      let codeExecutionResults = '';

      // Process the streaming response
      for await (const chunk of response) {
        if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
          continue;
        }

        const parts = chunk.candidates[0].content.parts[0];

        // Collect text content
        if (parts.text) {
          jsonlContent += parts.text;
          process.stdout.write(parts.text);
        }

        // Collect code execution results
        if (parts.executableCode) {
          console.log('\n🔧 Executing code:', parts.executableCode);
        }

        if (parts.codeExecutionResult) {
          codeExecutionResults += parts.codeExecutionResult;
          console.log('\n📋 Code execution result:', parts.codeExecutionResult);
        }
      }

      // Clean up the JSONL content
      jsonlContent = this.cleanJSONLContent(jsonlContent);

      // Validate JSONL format
      const validation = this.validateJSONL(jsonlContent);
      if (!validation.valid) {
        throw new Error(`Invalid JSONL format: ${validation.error}`);
      }

      // Generate output filename and save
      const filename = this.generateFilename(inputString, inputType);
      const outputPath = path.join(this.outputDir, filename);

      fs.writeFileSync(outputPath, jsonlContent, 'utf8');

      const recordCount = jsonlContent.split('\n').filter(line => line.trim()).length;

      console.log(`\n✅ Conversion completed successfully!`);
      console.log(`📄 Output file: ${outputPath}`);
      console.log(`📊 Records: ${recordCount}`);

      return {
        success: true,
        outputFile: outputPath,
        records: recordCount,
        metadata: {
          inputType,
          outputDir: this.outputDir,
          timestamp: new Date().toISOString(),
          codeExecutionResults: codeExecutionResults || null
        }
      };

    } catch (error: any) {
      console.error('❌ Conversion failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clean and format JSONL content
   */
  private cleanJSONLContent(content: string): string {
    // Remove any non-JSONL content (explanations, markdown, etc.)
    const lines = content.split('\n');
    const jsonLines = lines.filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      
      // Try to parse as JSON
      try {
        JSON.parse(trimmed);
        return true;
      } catch {
        return false;
      }
    });

    return jsonLines.join('\n');
  }

  /**
   * Validate JSONL content
   */
  private validateJSONL(content: string): { valid: boolean; error?: string } {
    if (!content.trim()) {
      return { valid: false, error: 'Empty content' };
    }

    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return { valid: false, error: 'No valid lines found' };
    }

    for (let i = 0; i < lines.length; i++) {
      try {
        JSON.parse(lines[i]);
      } catch (error) {
        return { valid: false, error: `Invalid JSON on line ${i + 1}: ${error}` };
      }
    }

    return { valid: true };
  }

  /**
   * Convert a file to JSONL
   */
  async convertFileToJSONL(
    filePath: string,
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    try {
      const content = fs.readFileSync(filePath);
      const mimeType = mime.getType(filePath) || '';
      
      // Set input type based on file extension
      const extension = path.extname(filePath).toLowerCase();
      const typeMap: Record<string, InputType> = {
        '.json': 'json',
        '.csv': 'csv',
        '.xml': 'xml',
        '.yaml': 'yaml',
        '.yml': 'yaml',
        '.xlsx': 'excel',
        '.xls': 'excel',
        '.pdf': 'pdf',
        '.txt': 'text'
      };

      options.inputType = options.inputType || typeMap[extension] || 'text';

      return await this.convertToJSONL(content, options);
    } catch (error: any) {
      return {
        success: false,
        error: `File read error: ${error.message}`
      };
    }
  }

  /**
   * Convert URL content to JSONL
   */
  async convertURLToJSONL(
    url: string,
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    try {
      // Use fetch to get the content
      const response = await fetch(url);
      const content = await response.text();
      
      options.inputType = options.inputType || 'url';
      
      return await this.convertToJSONL(content, options);
    } catch (error: any) {
      return {
        success: false,
        error: `URL fetch error: ${error.message}`
      };
    }
  }

  /**
   * Batch convert multiple inputs
   */
  async batchConvert(
    inputs: Array<{ data: string | Buffer | object; options?: ConversionOptions }>,
    batchOptions: ConversionOptions = {}
  ): Promise<ConversionResult[]> {
    const results: ConversionResult[] = [];
    
    for (let i = 0; i < inputs.length; i++) {
      console.log(`\n🔄 Processing item ${i + 1}/${inputs.length}`);
      const result = await this.convertToJSONL(inputs[i].data, {
        ...batchOptions,
        ...inputs[i].options
      });
      results.push(result);
    }

    return results;
  }
}

// Export default instance
export const jsonlConverter = new JSONLConverter();

// Export convenience functions
export async function convertToJSONL(
  input: string | Buffer | object,
  options?: ConversionOptions
): Promise<ConversionResult> {
  return jsonlConverter.convertToJSONL(input, options);
}

export async function convertFileToJSONL(
  filePath: string,
  options?: ConversionOptions
): Promise<ConversionResult> {
  return jsonlConverter.convertFileToJSONL(filePath, options);
}

export async function convertURLToJSONL(
  url: string,
  options?: ConversionOptions
): Promise<ConversionResult> {
  return jsonlConverter.convertURLToJSONL(url, options);
}
