const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function testHospitalsTable() {
  try {
    console.log('Testing hospitals table...');

    await client.connect();
    console.log('✅ Connected to PostgreSQL successfully!');

    // Check if hospitals table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'hospitais'
      );
    `);
    console.log('✅ Hospitais table exists:', tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // Check table structure
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'hospitais'
        ORDER BY ordinal_position;
      `);
      console.log('✅ Table structure:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
      });

      // Try to insert a test record
      console.log('Testing INSERT...');
      const testData = {
        codigo: 'test-123',
        nome: 'Hospital Teste',
        cod_municipio: '1234567',
        bairro: 'Centro',
        especialidades: 'Clínica Geral',
        leitos: 10
      };

      const insertQuery = `
        INSERT INTO hospitais (codigo, nome, cod_municipio, bairro, especialidades, leitos)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (codigo) DO NOTHING;
      `;

      const result = await client.query(insertQuery, [
        testData.codigo,
        testData.nome,
        testData.cod_municipio,
        testData.bairro,
        testData.especialidades,
        testData.leitos
      ]);

      console.log('✅ INSERT result:', result.rowCount, 'rows affected');

      // Check if record was inserted
      const checkInsert = await client.query('SELECT * FROM hospitais WHERE codigo = $1', [testData.codigo]);
      console.log('✅ Record found:', checkInsert.rows.length > 0);
      if (checkInsert.rows.length > 0) {
        console.log('✅ Record data:', checkInsert.rows[0]);
      }
    }

    await client.end();
    console.log('✅ Connection closed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testHospitalsTable();