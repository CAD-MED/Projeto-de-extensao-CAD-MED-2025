"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pacienteController = void 0;
const express_1 = __importDefault(require("express"));
const paciente_service_1 = __importDefault(require("../services/paciente.service"));
const validation_middleware_1 = require("../../middleware/validation.middleware");
const error_middleware_1 = require("../../middleware/error.middleware");
const logger_config_1 = require("../../../config/logger.config");
const paciente_validation_1 = require("../validation/paciente.validation");
require("dotenv/config");
const router = express_1.default.Router();
/**
 * GET /pacientes - Retorna todos os pacientes com paginação e filtros
 */
router.get('/pacientes', (0, validation_middleware_1.validateQuery)(paciente_validation_1.getPacientesQuerySchema), (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_config_1.apiLogger.info('Requisição para listar pacientes', {
        query: req.query,
        ip: req.ip
    });
    const resultado = yield paciente_service_1.default.getAllPacientes(req.query);
    const response = {
        success: true,
        message: 'Pacientes listados com sucesso',
        data: resultado,
        timestamp: new Date().toISOString()
    };
    logger_config_1.apiLogger.info('Pacientes listados com sucesso', {
        total: resultado.pagination.total,
        pagina: resultado.pagination.page
    });
    res.status(200).json(response);
})));
/**
 * GET /pacientes/:id - Retorna um paciente específico por ID
 */
router.get('/pacientes/:id', (0, validation_middleware_1.validateParams)(paciente_validation_1.pacienteParamsSchema), (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    logger_config_1.apiLogger.info('Requisição para buscar paciente por ID', {
        id,
        ip: req.ip
    });
    const paciente = yield paciente_service_1.default.getPacienteById(id);
    const response = {
        success: true,
        message: 'Paciente encontrado com sucesso',
        data: paciente,
        timestamp: new Date().toISOString()
    };
    logger_config_1.apiLogger.info('Paciente encontrado com sucesso', { id, nome: paciente.nome });
    res.status(200).json(response);
})));
/**
 * POST /pacientes - Cria múltiplos pacientes
 */
router.post('/pacientes', (0, validation_middleware_1.validate)({ body: paciente_validation_1.createMultiplosPacientesSchema }), (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pacientes, password } = req.body;
    logger_config_1.apiLogger.info('Requisição para criar múltiplos pacientes', {
        quantidade: pacientes === null || pacientes === void 0 ? void 0 : pacientes.length,
        ip: req.ip
    });
    // Verificar senha da API
    const REQUIRED_PASSWORD = process.env.API_PASSWORD;
    if (password !== REQUIRED_PASSWORD) {
        logger_config_1.apiLogger.warn('Tentativa de acesso com senha inválida', { ip: req.ip });
        throw new error_middleware_1.AppError('Senha inválida. Acesso negado.', 403);
    }
    yield paciente_service_1.default.createMultiplosPacientes(pacientes);
    const response = {
        success: true,
        message: 'Pacientes criados com sucesso',
        timestamp: new Date().toISOString()
    };
    logger_config_1.apiLogger.info('Múltiplos pacientes criados com sucesso', {
        quantidade: pacientes.length
    });
    res.status(201).json(response);
})));
/**
 * PUT /pacientes/:id - Atualiza um paciente
 */
router.put('/pacientes/:id', (0, validation_middleware_1.validate)({
    params: paciente_validation_1.pacienteParamsSchema,
    body: paciente_validation_1.updatePacienteSchema
}), (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    logger_config_1.apiLogger.info('Requisição para atualizar paciente', {
        id,
        dados: req.body,
        ip: req.ip
    });
    const paciente = yield paciente_service_1.default.updatePaciente(id, req.body);
    const response = {
        success: true,
        message: 'Paciente atualizado com sucesso',
        data: paciente,
        timestamp: new Date().toISOString()
    };
    logger_config_1.apiLogger.info('Paciente atualizado com sucesso', {
        id,
        nome: paciente.nome
    });
    res.status(200).json(response);
})));
/**
 * DELETE /pacientes/:id - Remove um paciente
 */
router.delete('/pacientes/:id', (0, validation_middleware_1.validateParams)(paciente_validation_1.pacienteParamsSchema), (0, error_middleware_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    logger_config_1.apiLogger.info('Requisição para deletar paciente', {
        id,
        ip: req.ip
    });
    yield paciente_service_1.default.deletePaciente(id);
    const response = {
        success: true,
        message: 'Paciente deletado com sucesso',
        timestamp: new Date().toISOString()
    };
    logger_config_1.apiLogger.info('Paciente deletado com sucesso', { id });
    res.status(200).json(response);
})));
exports.pacienteController = router;
