"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.servicesRoutes = servicesRoutes;
const fileReader_1 = require("../services/fileReader");
const MigrateToTable_1 = require("../services/MigrateToTable");
async function servicesRoutes(app) {
    // File Reader Service Routes
    app.get('/services/fileReader/readAllFiles', async (request, reply) => {
        try {
            const result = await (0, fileReader_1.readAllFiles)();
            return reply.send({
                success: true,
                data: result,
                count: result.length
            });
        }
        catch (error) {
            app.log.error(`Error reading files: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return reply.status(500).send({
                success: false,
                error: 'Failed to read files',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Migration Service Routes
    app.get('/services/migrate', async (request, reply) => {
        try {
            const migrateService = new MigrateToTable_1.MigrateToTable();
            await migrateService.migrate();
            return reply.send({
                success: true,
                message: 'Migration completed successfully'
            });
        }
        catch (error) {
            app.log.error(`Error during migration: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return reply.status(500).send({
                success: false,
                error: 'Migration failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Health check for services
    app.get('/services/health', async (request, reply) => {
        return reply.send({
            success: true,
            services: {
                fileReader: {
                    available: true,
                    methods: ['readAllFiles']
                },
                migrateToTable: {
                    available: true,
                    methods: ['migrate']
                }
            }
        });
    });
}
//# sourceMappingURL=services.js.map