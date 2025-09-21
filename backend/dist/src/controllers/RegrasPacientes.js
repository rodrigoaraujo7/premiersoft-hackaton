"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegrasPacientes = void 0;
const paciente4json_1 = require("../utils/paciente4json");
class RegrasPacientes {
    /**
     * Processes patient data by validating it and writing it to a JSON file.
     */
    async processar(data) {
        const paciente4json = new paciente4json_1.Paciente4json();
        var pacienteJsonPath = await paciente4json.processaPaciente4Json(data);
        return pacienteJsonPath;
    }
}
exports.RegrasPacientes = RegrasPacientes;
//# sourceMappingURL=RegrasPacientes.js.map