"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientUploadRoutes = patientUploadRoutes;
const pacienteUploadService_1 = require("../services/upload/pacienteUploadService");
async function patientUploadRoutes(fastify) {
    const patientUploadService = new pacienteUploadService_1.PatientUploadService();
    fastify.post('/upload/pacientes', async (req, reply) => {
        const data = await req.file();
        if (!data) {
            return reply.status(400).send({ error: 'No file uploaded' });
        }
        try {
            const result = await patientUploadService.upload(data);
            return reply.send({ result });
        }
        catch (error) {
            return reply.status(400).send({ error: error.message });
        }
    });
}
//# sourceMappingURL=pacienteUpload.js.map