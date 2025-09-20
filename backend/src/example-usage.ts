import { JSONLConverter, convertToJSONL, convertFileToJSONL, convertURLToJSONL } from './jsonlConverter';

/**
 * Example usage of the JSONL Converter
 * This demonstrates how to convert various data formats to JSONL using Gemini AI
 */

async function runExamples() {
  console.log('🚀 JSONL Converter Examples\n');

  // Initialize the converter
  const converter = new JSONLConverter({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-2.5-flash',
    outputDir: './src/Output',
    thinkingBudget: 0
  });

  try {
    // Example 1: Convert CSV data
    console.log('📊 Example 1: Converting CSV data...');
    const csvData = `name,age,city,occupation
John Doe,30,New York,Engineer
Jane Smith,25,Los Angeles,Designer
Bob Johnson,35,Chicago,Manager`;

    const result1 = await converter.convertToJSONL(csvData, {
      inputType: 'csv',
      preserveStructure: true,
      includeMetadata: true
    });

    console.log('Result:', result1);
    console.log('');

    // Example 2: Convert JSON data
    console.log('📋 Example 2: Converting JSON data...');
    const jsonData = {
      users: [
        { id: 1, name: 'Alice', email: 'alice@example.com', preferences: { theme: 'dark', notifications: true } },
        { id: 2, name: 'Bob', email: 'bob@example.com', preferences: { theme: 'light', notifications: false } },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', preferences: { theme: 'auto', notifications: true } }
      ],
      metadata: {
        total: 3,
        created: '2024-01-15'
      }
    };

    const result2 = await converter.convertToJSONL(jsonData, {
      inputType: 'json',
      flattenNested: true,
      includeMetadata: true
    });

    console.log('Result:', result2);
    console.log('');

    // Example 3: Convert XML data
    console.log('📄 Example 3: Converting XML data...');
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product id="1">
    <name>Laptop</name>
    <price>999.99</price>
    <category>Electronics</category>
    <specs>
      <ram>16GB</ram>
      <storage>512GB SSD</storage>
    </specs>
  </product>
  <product id="2">
    <name>Mouse</name>
    <price>29.99</price>
    <category>Accessories</category>
    <specs>
      <wireless>true</wireless>
      <dpi>1600</dpi>
    </specs>
  </product>
</products>`;

    const result3 = await converter.convertToJSONL(xmlData, {
      inputType: 'xml',
      preserveStructure: false,
      flattenNested: true
    });

    console.log('Result:', result3);
    console.log('');

    // Example 4: Convert YAML data
    console.log('📝 Example 4: Converting YAML data...');
    const yamlData = `---
config:
  database:
    host: localhost
    port: 5432
    name: myapp
  redis:
    host: localhost
    port: 6379
users:
  - name: admin
    role: superuser
    permissions: [read, write, delete]
  - name: user
    role: regular
    permissions: [read]`;

    const result4 = await converter.convertToJSONL(yamlData, {
      inputType: 'yaml',
      preserveStructure: true
    });

    console.log('Result:', result4);
    console.log('');

    // Example 5: Convert text data with custom prompt
    console.log('📝 Example 5: Converting text data with custom prompt...');
    const textData = `Product Review:
I recently purchased this amazing laptop and I'm very satisfied with it. The performance is outstanding, battery life is great, and the build quality is excellent. The only downside is the price, but you get what you pay for. I would definitely recommend it to anyone looking for a high-performance laptop.

Rating: 5/5
Price: $1299
Brand: TechCorp
Model: UltraBook Pro`;

    const result5 = await converter.convertToJSONL(textData, {
      inputType: 'text',
      customPrompt: 'Extract structured information about the product review including sentiment, rating, price, and key features mentioned.'
    });

    console.log('Result:', result5);
    console.log('');

    // Example 6: Batch conversion
    console.log('🔄 Example 6: Batch conversion...');
    const batchInputs = [
      {
        data: 'Apple,Red,1.50\nBanana,Yellow,0.80\nOrange,Orange,1.20',
        options: { inputType: 'csv' as const }
      },
      {
        data: { message: 'Hello World', timestamp: new Date().toISOString() },
        options: { includeMetadata: true }
      }
    ];

    const batchResults = await converter.batchConvert(batchInputs, {
      includeMetadata: true
    });

    console.log('Batch Results:', batchResults);
    console.log('');

    console.log('✅ All examples completed successfully!');

  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Example of using convenience functions
async function convenienceExamples() {
  console.log('\n🎯 Convenience Function Examples\n');

  try {
    // Using the convenience functions directly
    const result1 = await convertToJSONL('name,value\nItem1,100\nItem2,200', {
      inputType: 'csv'
    });
    console.log('Direct conversion result:', result1);

    // Convert a URL (example - you'll need to replace with a real URL)
    // const result2 = await convertURLToJSONL('https://api.example.com/data', {
    //   inputType: 'json'
    // });
    // console.log('URL conversion result:', result2);

  } catch (error) {
    console.error('❌ Error in convenience examples:', error);
  }
}

// Example of converting different data types
async function dataTypeExamples() {
  console.log('\n🔧 Data Type Examples\n');

  const converter = new JSONLConverter();

  try {
    // Convert an array of objects
    const arrayData = [
      { id: 1, name: 'Product A', price: 19.99 },
      { id: 2, name: 'Product B', price: 29.99 },
      { id: 3, name: 'Product C', price: 39.99 }
    ];

    const result1 = await converter.convertToJSONL(arrayData);
    console.log('Array conversion result:', result1);

    // Convert a complex nested object
    const complexData = {
      company: {
        name: 'TechCorp',
        employees: [
          { name: 'John', department: 'Engineering', salary: 75000 },
          { name: 'Jane', department: 'Marketing', salary: 65000 }
        ],
        departments: {
          engineering: { head: 'John', budget: 500000 },
          marketing: { head: 'Jane', budget: 300000 }
        }
      },
      metrics: {
        revenue: 1000000,
        growth: 0.15
      }
    };

    const result2 = await converter.convertToJSONL(complexData, {
      flattenNested: true,
      includeMetadata: true
    });
    console.log('Complex object conversion result:', result2);

  } catch (error) {
    console.error('❌ Error in data type examples:', error);
  }
}

// Run all examples
async function main() {
  console.log('🌟 JSONL Converter - Comprehensive Examples\n');
  console.log('Make sure to set your GEMINI_API_KEY environment variable!\n');

  await runExamples();
  await convenienceExamples();
  await dataTypeExamples();

  console.log('\n🎉 All examples completed!');
  console.log('📁 Check the ./src/Output directory for generated JSONL files.');
}

// Export for use in other modules
export {
  runExamples,
  convenienceExamples,
  dataTypeExamples
};

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
