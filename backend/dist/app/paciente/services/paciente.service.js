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
const paciente_repository_1 = __importDefault(require("../repository/paciente.repository"));
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
class PacienteService {
    /**
     * Buscar todos os pacientes com paginação e filtros
     */
    getAllPacientes(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_config_1.apiLogger.info('Iniciando busca de pacientes', { query });
                const resultado = yield paciente_repository_1.default.getAll(query);
                logger_config_1.apiLogger.info('Busca de pacientes concluída', {
                    total: resultado.pagination.total,
                    pagina: resultado.pagination.page
                });
                return resultado;
            }
            catch (error) {
                logger_config_1.apiLogger.error('Erro no serviço ao buscar pacientes', {
                    error: getErrorMessage(error),
                    query
                });
                if (error instanceof error_middleware_1.AppError) {
                    throw error;
                }
                throw new error_middleware_1.AppError('Erro ao buscar pacientes', 500);
            }
        });
    }
    /**
     * Buscar um paciente por ID
     */
    getPacienteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_config_1.apiLogger.info('Buscando paciente por ID', { id });
                if (!id || id <= 0) {
                    throw new error_middleware_1.AppError('ID do paciente inválido', 400);
                }
                const paciente = yield paciente_repository_1.default.getOne(id);
                if (!paciente) {
                    throw new error_middleware_1.AppError('Paciente não encontrado', 404);
                }
                logger_config_1.apiLogger.info('Paciente encontrado', {
                    id,
                    nome: paciente.nome
                });
                return paciente;
            }
            catch (error) {
                logger_config_1.apiLogger.error('Erro no serviço ao buscar paciente por ID', {
                    error: getErrorMessage(error),
                    id
                });
                if (error instanceof error_middleware_1.AppError) {
                    throw error;
                }
                throw new error_middleware_1.AppError('Erro ao buscar paciente', 500);
            }
        });
    }
    /**
     * Criar múltiplos pacientes
     */
    createMultiplosPacientes(pacientes) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_config_1.apiLogger.info('Iniciando criação de múltiplos pacientes', {
                    quantidade: pacientes.length
                });
                // Validações de regra de negócio
                if (!pacientes || pacientes.length === 0) {
                    throw new error_middleware_1.AppError('Lista de pacientes não pode estar vazia', 400);
                }
                // Verificar se todos os pacientes têm o mesmo idUser
                const idUser = pacientes[0].idUser;
                const todosComMesmoIdUser = pacientes.every(p => p.idUser === idUser);
                if (!todosComMesmoIdUser) {
                    throw new error_middleware_1.AppError('Todos os pacientes devem ter o mesmo idUser', 400);
                }
                // Transformar dados se necessário
                const dadosPacientes = pacientes.map(p => (Object.assign(Object.assign({}, p), { createdAt: p.createdAt || new Date().toISOString() })));
                yield paciente_repository_1.default.createMultiplosPacientes(dadosPacientes);
                logger_config_1.apiLogger.info('Múltiplos pacientes criados com sucesso', {
                    quantidade: pacientes.length,
                    idUser
                });
            }
            catch (error) {
                logger_config_1.apiLogger.error('Erro no serviço ao criar múltiplos pacientes', {
                    error: getErrorMessage(error),
                    quantidade: pacientes === null || pacientes === void 0 ? void 0 : pacientes.length
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
                logger_config_1.apiLogger.info('Atualizando paciente', { id, dados });
                if (!id || id <= 0) {
                    throw new error_middleware_1.AppError('ID do paciente inválido', 400);
                }
                // Verificar se o paciente existe
                yield this.getPacienteById(id);
                const pacienteAtualizado = yield paciente_repository_1.default.updatePaciente(id, Object.assign(Object.assign({}, dados), { updatedAt: new Date().toISOString() }));
                if (!pacienteAtualizado) {
                    throw new error_middleware_1.AppError('Falha ao atualizar paciente', 500);
                }
                logger_config_1.apiLogger.info('Paciente atualizado com sucesso', {
                    id,
                    nome: pacienteAtualizado.nome
                });
                return pacienteAtualizado;
            }
            catch (error) {
                logger_config_1.apiLogger.error('Erro no serviço ao atualizar paciente', {
                    error: getErrorMessage(error),
                    id,
                    dados
                });
                if (error instanceof error_middleware_1.AppError) {
                    throw error;
                }
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
                logger_config_1.apiLogger.info('Deletando paciente', { id });
                if (!id || id <= 0) {
                    throw new error_middleware_1.AppError('ID do paciente inválido', 400);
                }
                // Verificar se o paciente existe
                yield this.getPacienteById(id);
                const deletado = yield paciente_repository_1.default.deletePaciente(id);
                if (!deletado) {
                    throw new error_middleware_1.AppError('Falha ao deletar paciente', 500);
                }
                logger_config_1.apiLogger.info('Paciente deletado com sucesso', { id });
            }
            catch (error) {
                logger_config_1.apiLogger.error('Erro no serviço ao deletar paciente', {
                    error: getErrorMessage(error),
                    id
                });
                if (error instanceof error_middleware_1.AppError) {
                    throw error;
                }
                throw new error_middleware_1.AppError('Erro ao deletar paciente', 500);
            }
        });
    }
}
exports.default = new PacienteService();
