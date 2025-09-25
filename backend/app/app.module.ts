import 'dotenv/config';
import { Application } from 'express';
import express from 'express';
import { pacienteController } from './paciente/controllers/paciente.controller';
import sequelize from '../config/sequelize.config';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import logger, { apiLogger, dbLogger } from '../config/logger.config';


export const AppModule = (app: Application) => {
    // Middleware de parsing JSON
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Middleware de logging de requisições
    app.use((req, res, next) => {
        apiLogger.info('Nova requisição recebida', {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        next();
    });

    // Sincronização do Sequelize (cria tabelas se elas não existirem)
    sequelize.sync({ force: false }).then(() => {
        dbLogger.info('Conexão com banco de dados estabelecida e tabelas sincronizadas');
    }).catch((error) => {
        dbLogger.error('Erro ao conectar com banco de dados', { error: error.message });
    });

    // Rotas da API
    app.use('/api', pacienteController);

    // Swagger
    const swaggerSpec = swaggerJsdoc({
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
                        required: ['id', 'idUser', 'nome', 'idade', 'genero', 'patologia'],
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
            },
            paths: {
                '/api/pacientes': {
                    get: {
                        tags: ['Pacientes'],
                        summary: 'Listar pacientes com paginação e filtros',
                        description: 'Retorna uma lista paginada de pacientes com possibilidade de filtros',
                        parameters: [
                            {
                                name: 'page',
                                in: 'query',
                                description: 'Número da página',
                                required: false,
                                schema: { type: 'integer', minimum: 1, default: 1 }
                            },
                            {
                                name: 'limit',
                                in: 'query',
                                description: 'Número de itens por página',
                                required: false,
                                schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
                            },
                            {
                                name: 'idUser',
                                in: 'query',
                                description: 'Filtrar por ID do usuário',
                                required: false,
                                schema: { type: 'string' }
                            },
                            {
                                name: 'nome',
                                in: 'query',
                                description: 'Filtrar por nome (busca parcial)',
                                required: false,
                                schema: { type: 'string' }
                            },
                            {
                                name: 'genero',
                                in: 'query',
                                description: 'Filtrar por gênero',
                                required: false,
                                schema: { type: 'string', enum: ['M', 'F', 'Outro'] }
                            },
                            {
                                name: 'patologia',
                                in: 'query',
                                description: 'Filtrar por patologia (busca parcial)',
                                required: false,
                                schema: { type: 'string' }
                            }
                        ],
                        responses: {
                            '200': {
                                description: 'Lista de pacientes retornada com sucesso',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/PaginatedResponse' }
                                    }
                                }
                            },
                            '400': {
                                description: 'Parâmetros de consulta inválidos',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                                    }
                                }
                            },
                            '500': {
                                description: 'Erro interno do servidor',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                                    }
                                }
                            }
                        }
                    },
                    post: {
                        tags: ['Pacientes'],
                        summary: 'Criar múltiplos pacientes',
                        description: 'Cria múltiplos pacientes de uma vez, requer senha de autenticação',
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/CreatePacientesRequest' }
                                }
                            }
                        },
                        responses: {
                            '201': {
                                description: 'Pacientes criados com sucesso',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ApiResponse' }
                                    }
                                }
                            },
                            '400': {
                                description: 'Dados de entrada inválidos',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                                    }
                                }
                            },
                            '403': {
                                description: 'Senha inválida - acesso negado',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                                    }
                                }
                            },
                            '500': {
                                description: 'Erro interno do servidor',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                                    }
                                }
                            }
                        }
                    }
                },
                '/api/pacientes/{id}': {
                    get: {
                        tags: ['Pacientes'],
                        summary: 'Buscar paciente por ID',
                        description: 'Retorna um paciente específico pelo seu ID',
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                description: 'ID do paciente',
                                required: true,
                                schema: { type: 'integer', minimum: 1 }
                            }
                        ],
                        responses: {
                            '200': {
                                description: 'Paciente encontrado com sucesso',
                                content: {
                                    'application/json': {
                                        schema: {
                                            allOf: [
                                                { $ref: '#/components/schemas/ApiResponse' },
                                                {
                                                    type: 'object',
                                                    properties: {
                                                        data: { $ref: '#/components/schemas/Paciente' }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            '400': {
                                description: 'ID inválido',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                                    }
                                }
                            },
                            '404': {
                                description: 'Paciente não encontrado',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                                    }
                                }
                            },
                            '500': {
                                description: 'Erro interno do servidor',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                                    }
                                }
                            }
                        }
                    },
                    put: {
                        tags: ['Pacientes'],
                        summary: 'Atualizar paciente',
                        description: 'Atualiza os dados de um paciente existente',
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                description: 'ID do paciente',
                                required: true,
                                schema: { type: 'integer', minimum: 1 }
                            }
                        ],
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/UpdatePacienteRequest' }
                                }
                            }
                        },
                        responses: {
                            '200': {
                                description: 'Paciente atualizado com sucesso',
                                content: {
                                    'application/json': {
                                        schema: {
                                            allOf: [
                                                { $ref: '#/components/schemas/ApiResponse' },
                                                {
                                                    type: 'object',
                                                    properties: {
                                                        data: { $ref: '#/components/schemas/Paciente' }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            '400': {
                                description: 'Dados inválidos',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                                    }
                                }
                            },
                            '404': {
                                description: 'Paciente não encontrado',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                                    }
                                }
                            },
                            '500': {
                                description: 'Erro interno do servidor',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                                    }
                                }
                            }
                        }
                    },
                    delete: {
                        tags: ['Pacientes'],
                        summary: 'Deletar paciente',
                        description: 'Remove um paciente do sistema',
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                description: 'ID do paciente',
                                required: true,
                                schema: { type: 'integer', minimum: 1 }
                            }
                        ],
                        responses: {
                            '200': {
                                description: 'Paciente deletado com sucesso',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ApiResponse' }
                                    }
                                }
                            },
                            '400': {
                                description: 'ID inválido',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                                    }
                                }
                            },
                            '404': {
                                description: 'Paciente não encontrado',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                                    }
                                }
                            },
                            '500': {
                                description: 'Erro interno do servidor',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                                    }
                                }
                            }
                        }
                    }
                },
                '/health': {
                    get: {
                        tags: ['Sistema'],
                        summary: 'Health Check',
                        description: 'Verifica se a API está funcionando corretamente',
                        responses: {
                            '200': {
                                description: 'API funcionando corretamente',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/ApiResponse' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        apis: []
    });

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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
    app.use('*', notFoundHandler);

    // Middleware de tratamento de erros (deve ser o último)
    app.use(errorHandler);
};
