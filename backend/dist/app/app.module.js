"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const paciente_controller_1 = require("./paciente/controllers/paciente.controller");
const sequelize_config_1 = __importDefault(require("../config/sequelize.config"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const error_middleware_1 = require("./middleware/error.middleware");
const logger_config_1 = require("../config/logger.config");
const AppModule = (app) => {
    // Middleware de parsing JSON
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Middleware de logging de requisições
    app.use((req, res, next) => {
        logger_config_1.apiLogger.info('Nova requisição recebida', {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        next();
    });
    // Sincronização do Sequelize (cria tabelas se elas não existirem)
    sequelize_config_1.default.sync({ force: false }).then(() => {
        logger_config_1.dbLogger.info('Conexão com banco de dados estabelecida e tabelas sincronizadas');
    }).catch((error) => {
        logger_config_1.dbLogger.error('Erro ao conectar com banco de dados', { error: error.message });
    });
    // Rotas da API
    app.use('/api', paciente_controller_1.pacienteController);
    // Swagger
    const swaggerSpec = (0, swagger_jsdoc_1.default)({
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'CAD-MED API',
                version: '2.0.0',
                description: 'API para gerenciamento de pacientes do sistema CAD-MED',
                contact: {
                    name: 'CAD-MED Team',
                    email: 'support@cadmed.com'
                }
            },
            servers: [
                {
                    url: process.env.SWAGGER_SERVER_URL || `http://localhost:${process.env.PORT || 3000}`,
                    description: 'Servidor de desenvolvimento'
                }
            ],
            components: {
                schemas: {
                    Paciente: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer', example: 1, description: 'ID único do paciente' },
                            idUser: { type: 'string', example: 'abc123', description: 'ID do usuário/sessão' },
                            nome: { type: 'string', example: 'Rafael Silva', description: 'Nome completo do paciente' },
                            idade: { type: 'integer', example: 25, minimum: 0, maximum: 150, description: 'Idade do paciente' },
                            genero: { type: 'string', enum: ['M', 'F', 'Outro'], example: 'M', description: 'Gênero do paciente' },
                            patologia: { type: 'string', example: 'Hipertensão arterial', description: 'Patologia ou diagnóstico' },
                            createdAt: { type: 'string', format: 'date-time', example: '2025-09-24T12:00:00Z' },
                            updatedAt: { type: 'string', format: 'date-time', example: '2025-09-24T12:00:00Z' }
                        }
                    },
                    CreatePacientesRequest: {
                        type: 'object',
                        required: ['password', 'pacientes'],
                        properties: {
                            password: { type: 'string', description: 'Senha de autenticação da API' },
                            pacientes: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/CreatePacienteData' },
                                minItems: 1,
                                description: 'Lista de pacientes a serem criados'
                            }
                        }
                    },
                    CreatePacienteData: {
                        type: 'object',
                        required: ['idUser', 'nome', 'idade', 'genero', 'patologia'],
                        properties: {
                            idUser: { type: 'string', example: 'abc123' },
                            nome: { type: 'string', example: 'Rafael Silva', minLength: 2, maxLength: 255 },
                            idade: { type: 'integer', example: 25, minimum: 0, maximum: 150 },
                            genero: { type: 'string', enum: ['M', 'F', 'Outro'], example: 'M' },
                            patologia: { type: 'string', example: 'Hipertensão arterial', minLength: 1, maxLength: 500 },
                            createdAt: { type: 'string', format: 'date-time', example: '2025-09-24T12:00:00Z' }
                        }
                    },
                    UpdatePacienteRequest: {
                        type: 'object',
                        properties: {
                            nome: { type: 'string', example: 'Rafael Silva', minLength: 2, maxLength: 255 },
                            idade: { type: 'integer', example: 25, minimum: 0, maximum: 150 },
                            genero: { type: 'string', enum: ['M', 'F', 'Outro'], example: 'M' },
                            patologia: { type: 'string', example: 'Hipertensão arterial', minLength: 1, maxLength: 500 }
                        },
                        minProperties: 1
                    },
                    ApiResponse: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Operação realizada com sucesso' },
                            data: { type: 'object', description: 'Dados da resposta' },
                            timestamp: { type: 'string', format: 'date-time', example: '2025-09-24T12:00:00Z' }
                        }
                    },
                    PaginatedResponse: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Pacientes listados com sucesso' },
                            data: {
                                type: 'object',
                                properties: {
                                    data: { type: 'array', items: { $ref: '#/components/schemas/Paciente' } },
                                    pagination: {
                                        type: 'object',
                                        properties: {
                                            page: { type: 'integer', example: 1 },
                                            limit: { type: 'integer', example: 10 },
                                            total: { type: 'integer', example: 100 },
                                            totalPages: { type: 'integer', example: 10 }
                                        }
                                    }
                                }
                            },
                            timestamp: { type: 'string', format: 'date-time' }
                        }
                    },
                    ErrorResponse: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: false },
                            message: { type: 'string', example: 'Erro na operação' },
                            error: { type: 'string', description: 'Detalhes do erro' },
                            timestamp: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        },
        apis: []
    });
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
    // Health check endpoint
    app.get('/health', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'API está funcionando',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0'
        });
    });
    // Middleware de rota não encontrada (deve vir antes do error handler)
    app.use('*', error_middleware_1.notFoundHandler);
    // Middleware de tratamento de erros (deve ser o último)
    app.use(error_middleware_1.errorHandler);
};
exports.AppModule = AppModule;
