import { MigrateToTable } from './src/services/MigrateToTable';

async function testMigration() {
  try {
    console.log('Starting migration test...');
    const migrateService = new MigrateToTable();
    await migrateService.migrate();
    console.log('Migration test completed successfully!');
  } catch (error) {
    console.error('Migration test failed:', error);
  }
}

testMigration();