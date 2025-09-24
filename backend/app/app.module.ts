import 'dotenv/config';
import { Application } from 'express';
import express from 'express';
import { pacienteController } from './paciente/controllers/paciente.controller';
import sequelize from '../config/sequelize.config';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';


export const AppModule = (app: Application) => {
    app.use(express.json());
    // Sincronização do Sequelize (cria tabelas se elas não existirem)
    sequelize.sync({ force: false }) // force: true recria as tabelas toda vez que reiniciar

    // API de exemplo
    app.use('/api', pacienteController);

    // Swagger
    const swaggerSpec = swaggerJsdoc({
        definition: {
            openapi: '3.0.0',
            info: { title: 'CAD-MED API', version: '1.0.0' },
            servers: [
                { url: process.env.SWAGGER_SERVER_URL || `http://localhost:${process.env.PORT || 3000}` }
            ],
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer', example: 1 },
                            idUser: { type: 'string', example: 'abc123' },
                            nome: { type: 'string', example: 'Rafael' },
                            idade: { type: 'integer', example: 20 },
                            genero: { type: 'string', example: 'M' },
                            patologia: { type: 'string', example: 'Hipertensão' },
                            createdAt: { type: 'string', format: 'date-time', example: '2025-09-24T12:00:00Z' }
                        }
                    },
                    CreatePacientesRequest: {
                        type: 'object',
                        required: ['password', 'pacientes'],
                        properties: {
                            password: { type: 'string' },
                            pacientes: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/User' }
                            }
                        }
                    }
                }
            },
            paths: {
                '/api/pacientes': {
                    get: {
                        summary: 'Listar pacientes',
                        responses: {
                            '200': {
                                description: 'Lista de pacientes',
                                content: {
                                    'application/json': {
                                        schema: { type: 'array', items: { $ref: '#/components/schemas/User' } }
                                    }
                                }
                            }
                        }
                    },
                    post: {
                        summary: 'Criar múltiplos pacientes',
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/CreatePacientesRequest' }
                                }
                            }
                        },
                        responses: {
                            '201': { description: 'Criado' },
                            '403': { description: 'Senha inválida' }
                        }
                    }
                }
            }
        },
        apis: []
    });

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

};
