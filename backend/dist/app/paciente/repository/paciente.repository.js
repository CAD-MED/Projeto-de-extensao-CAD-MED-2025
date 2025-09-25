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
Object.defineProperty(exports, "__esModule", { value: true });
const Paciente_model_1 = require("../models/Paciente.model");
const sequelize_1 = require("sequelize");
const logger_config_1 = require("../../../config/logger.config");
const error_middleware_1 = require("../../middleware/error.middleware");
// Helper para extrair mensagem de erro
const getErrorMessage = (error) => {
    if (error instanceof Error)
        return error.message;
    if (typeof error === 'string')
        return error;
    return 'Erro desconhecido';
};
class PacienteRepository {
    /**
     * Buscar todos os pacientes com paginação e filtros
     */
    getAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_config_1.dbLogger.info('Buscando pacientes', { query });
                const { page = 1, limit = 10, idUser, nome, genero, patologia } = query;
                const offset = (page - 1) * limit;
                // Construir filtros
                const where = {};
                if (idUser)
                    where.idUser = idUser;
                if (nome)
                    where.nome = { [sequelize_1.Op.like]: `%${nome}%` };
                if (genero)
                    where.genero = genero;
                if (patologia)
                    where.patologia = { [sequelize_1.Op.like]: `%${patologia}%` };
                const { rows: pacientes, count: total } = yield Paciente_model_1.Paciente.findAndCountAll({
                    where,
                    limit: Number(limit),
                    offset,
                    order: [['createdAt', 'DESC']],
                    raw: false
                });
                const totalPages = Math.ceil(total / limit);
                logger_config_1.dbLogger.info('Pacientes encontrados', {
                    total,
                    page,
                    limit,
                    totalPages,
                    filtros: where
                });
                return {
                    data: pacientes,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        totalPages
                    }
                };
            }
            catch (error) {
                logger_config_1.dbLogger.error('Erro ao buscar pacientes', { error: getErrorMessage(error), query });
                throw new error_middleware_1.AppError('Erro ao buscar pacientes', 500);
            }
        });
    }
    /**
     * Buscar um paciente por ID
     */
    getOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_config_1.dbLogger.info('Buscando paciente por ID', { id });
                const paciente = yield Paciente_model_1.Paciente.findByPk(id);
                if (!paciente) {
                    logger_config_1.dbLogger.warn('Paciente não encontrado', { id });
                    return null;
                }
                logger_config_1.dbLogger.info('Paciente encontrado', { id, nome: paciente.nome });
                return paciente;
            }
            catch (error) {
                logger_config_1.dbLogger.error('Erro ao buscar paciente por ID', { error: getErrorMessage(error), id });
                throw new error_middleware_1.AppError('Erro ao buscar paciente', 500);
            }
        });
    }
    /**
     * Criar múltiplos pacientes
     */
    createMultiplosPacientes(pacientes) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                logger_config_1.dbLogger.info('Iniciando criação de múltiplos pacientes', {
                    quantidade: pacientes.length,
                    idUser: (_a = pacientes[0]) === null || _a === void 0 ? void 0 : _a.idUser
                });
                if (pacientes.length === 0) {
                    throw new error_middleware_1.AppError('Lista de pacientes não pode estar vazia', 400);
                }
                const idUser = pacientes[0].idUser;
                // Deletar registros existentes para o mesmo idUser
                const deletedCount = yield Paciente_model_1.Paciente.destroy({
                    where: { idUser }
                });
                logger_config_1.dbLogger.info('Registros existentes removidos', {
                    idUser,
                    deletedCount
                });
                // Criar novos pacientes
                const novosPacientes = yield Paciente_model_1.Paciente.bulkCreate(pacientes, {
                    validate: true,
                    returning: true
                });
                logger_config_1.dbLogger.info('Pacientes criados com sucesso', {
                    quantidade: novosPacientes.length,
                    idUser
                });
            }
            catch (error) {
                logger_config_1.dbLogger.error('Erro ao criar múltiplos pacientes', {
                    error: getErrorMessage(error),
                    quantidade: pacientes.length
                });
                if (error instanceof error_middleware_1.AppError) {
                    throw error;
                }
                throw new error_middleware_1.AppError('Erro ao criar pacientes', 500);
            }
        });
    }
    /**
     * Atualizar um paciente
     */
    updatePaciente(id, dados) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_config_1.dbLogger.info('Atualizando paciente', { id, dados });
                const [affectedRows] = yield Paciente_model_1.Paciente.update(dados, {
                    where: { id },
                    validate: true
                });
                if (affectedRows === 0) {
                    logger_config_1.dbLogger.warn('Nenhum paciente foi atualizado', { id });
                    return null;
                }
                const pacienteAtualizado = yield this.getOne(id);
                logger_config_1.dbLogger.info('Paciente atualizado com sucesso', {
                    id,
                    nome: pacienteAtualizado === null || pacienteAtualizado === void 0 ? void 0 : pacienteAtualizado.nome
                });
                return pacienteAtualizado;
            }
            catch (error) {
                logger_config_1.dbLogger.error('Erro ao atualizar paciente', { error: getErrorMessage(error), id, dados });
                throw new error_middleware_1.AppError('Erro ao atualizar paciente', 500);
            }
        });
    }
    /**
     * Deletar um paciente
     */
    deletePaciente(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_config_1.dbLogger.info('Deletando paciente', { id });
                const deletedCount = yield Paciente_model_1.Paciente.destroy({
                    where: { id }
                });
                const sucesso = deletedCount > 0;
                if (sucesso) {
                    logger_config_1.dbLogger.info('Paciente deletado com sucesso', { id });
                }
                else {
                    logger_config_1.dbLogger.warn('Nenhum paciente foi deletado', { id });
                }
                return sucesso;
            }
            catch (error) {
                logger_config_1.dbLogger.error('Erro ao deletar paciente', { error: getErrorMessage(error), id });
                throw new error_middleware_1.AppError('Erro ao deletar paciente', 500);
            }
        });
    }
}
// Exporta uma instância única do PacienteRepository
exports.default = new PacienteRepository();
