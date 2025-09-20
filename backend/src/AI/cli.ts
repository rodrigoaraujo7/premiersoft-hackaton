#!/usr/bin/env node

import { JSONLConverter } from './jsonlConverter';
import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';

const program = new Command();

program
  .name('jsonl-converter')
  .description('Convert any data format to JSONL using Gemini AI')
  .version('1.0.0');

program
  .command('convert')
  .description('Convert data to JSONL format')
  .argument('<input>', 'Input data (string, file path, or URL)')
  .option('-t, --type <type>', 'Input type (text, json, csv, xml, yaml, url, file)', 'auto')
  .option('-o, --output <dir>', 'Output directory', './src/Output')
  .option('-k, --api-key <key>', 'Gemini API key (or set GEMINI_API_KEY env var)')
  .option('--preserve-structure', 'Preserve nested structure', false)
  .option('--flatten-nested', 'Flatten nested objects', false)
  .option('--include-metadata', 'Include metadata in output', false)
  .option('-p, --prompt <prompt>', 'Custom conversion prompt')
  .option('--model <model>', 'Gemini model to use', 'gemini-2.5-flash')
  .action(async (input, options) => {
    try {
      const converter = new JSONLConverter({
        apiKey: options.apiKey || process.env.GEMINI_API_KEY,
        model: options.model,
        outputDir: options.output
      });

      let result;
      
      // Determine if input is a file path or URL
      if (options.type === 'file' || fs.existsSync(input)) {
        result = await converter.convertFileToJSONL(input, {
          inputType: options.type !== 'auto' ? options.type : undefined,
          preserveStructure: options.preserveStructure,
          flattenNested: options.flattenNested,
          includeMetadata: options.includeMetadata,
          customPrompt: options.prompt
        });
      } else if (options.type === 'url' || input.startsWith('http')) {
        result = await converter.convertURLToJSONL(input, {
          inputType: 'url',
          preserveStructure: options.preserveStructure,
          flattenNested: options.flattenNested,
          includeMetadata: options.includeMetadata,
          customPrompt: options.prompt
        });
      } else {
        // Treat as direct data
        result = await converter.convertToJSONL(input, {
          inputType: options.type !== 'auto' ? options.type : undefined,
          preserveStructure: options.preserveStructure,
          flattenNested: options.flattenNested,
          includeMetadata: options.includeMetadata,
          customPrompt: options.prompt
        });
      }

      if (result.success) {
        console.log('✅ Conversion successful!');
        console.log(`📄 Output file: ${result.outputFile}`);
        console.log(`📊 Records: ${result.records}`);
        if (result.metadata) {
          console.log(`📋 Metadata:`, result.metadata);
        }
      } else {
        console.error('❌ Conversion failed:', result.error);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

program
  .command('batch')
  .description('Convert multiple files or data sources to JSONL')
  .argument('<files...>', 'File paths or data to convert')
  .option('-o, --output <dir>', 'Output directory', './src/Output')
  .option('-k, --api-key <key>', 'Gemini API key (or set GEMINI_API_KEY env var)')
  .option('--preserve-structure', 'Preserve nested structure', false)
  .option('--flatten-nested', 'Flatten nested objects', false)
  .option('--include-metadata', 'Include metadata in output', false)
  .option('--model <model>', 'Gemini model to use', 'gemini-2.5-flash')
  .action(async (files, options) => {
    try {
      const converter = new JSONLConverter({
        apiKey: options.apiKey || process.env.GEMINI_API_KEY,
        model: options.model,
        outputDir: options.output
      });

      const inputs = files.map(file => ({
        data: fs.existsSync(file) ? fs.readFileSync(file) : file,
        options: {
          preserveStructure: options.preserveStructure,
          flattenNested: options.flattenNested,
          includeMetadata: options.includeMetadata
        }
      }));

      const results = await converter.batchConvert(inputs);

      let successCount = 0;
      let failCount = 0;

      results.forEach((result, index) => {
        if (result.success) {
          console.log(`✅ ${files[index]}: ${result.records} records -> ${result.outputFile}`);
          successCount++;
        } else {
          console.error(`❌ ${files[index]}: ${result.error}`);
          failCount++;
        }
      });

      console.log(`\n📊 Batch conversion complete: ${successCount} successful, ${failCount} failed`);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

program
  .command('examples')
  .description('Run example conversions')
  .option('-k, --api-key <key>', 'Gemini API key (or set GEMINI_API_KEY env var)')
  .action(async (options) => {
    try {
      // Import and run examples
      const { runExamples, convenienceExamples, dataTypeExamples } = await import('./example-usage');
      
      console.log('🚀 Running JSONL Converter Examples...\n');
      
      // Set API key if provided
      if (options.apiKey) {
        process.env.GEMINI_API_KEY = options.apiKey;
      }
      
      await runExamples();
      await convenienceExamples();
      await dataTypeExamples();
      
      console.log('\n🎉 All examples completed successfully!');
    } catch (error) {
      console.error('❌ Error running examples:', error);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    console.log('📋 JSONL Converter Configuration:');
    console.log(`🔑 API Key: ${process.env.GEMINI_API_KEY ? 'Set' : 'Not set'}`);
    console.log(`🤖 Default Model: gemini-2.5-flash`);
    console.log(`📁 Default Output: ./src/Output`);
    console.log(`🔧 Code Execution: Enabled`);
    console.log(`🌐 Google Search: Enabled`);
  });

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
