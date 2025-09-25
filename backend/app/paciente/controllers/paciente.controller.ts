import express, { Request, Response } from 'express';
import PacienteService from '../services/paciente.service';
import { validate, validateParams, validateQuery } from '../../middleware/validation.middleware';
import { asyncHandler, AppError } from '../../middleware/error.middleware';
import { apiLogger } from '../../../config/logger.config';
import { 
    createMultiplosPacientesSchema,
    updatePacienteSchema,
    getPacientesQuerySchema,
    pacienteParamsSchema
} from '../validation/paciente.validation';
import { ApiResponse } from '../dto/paciente.dto';
import 'dotenv/config';

const router = express.Router();

/**
 * GET /pacientes - Retorna todos os pacientes com paginação e filtros
 */
router.get('/pacientes', 
    validateQuery(getPacientesQuerySchema),
    asyncHandler(async (req: Request, res: Response) => {
        apiLogger.info('Requisição para listar pacientes', { 
            query: req.query,
            ip: req.ip 
        });

        const resultado = await PacienteService.getAllPacientes(req.query);

        const response: ApiResponse = {
            success: true,
            message: 'Pacientes listados com sucesso',
            data: resultado,
            timestamp: new Date().toISOString()
        };

        apiLogger.info('Pacientes listados com sucesso', { 
            total: resultado.pagination.total,
            pagina: resultado.pagination.page 
        });

        res.status(200).json(response);
    })
);

/**
 * GET /pacientes/:id - Retorna um paciente específico por ID
 */
router.get('/pacientes/:id',
    validateParams(pacienteParamsSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);

        apiLogger.info('Requisição para buscar paciente por ID', { 
            id,
            ip: req.ip 
        });

        const paciente = await PacienteService.getPacienteById(id);

        const response: ApiResponse = {
            success: true,
            message: 'Paciente encontrado com sucesso',
            data: paciente,
            timestamp: new Date().toISOString()
        };

        apiLogger.info('Paciente encontrado com sucesso', { id, nome: paciente.nome });

        res.status(200).json(response);
    })
);

/**
 * POST /pacientes - Cria múltiplos pacientes
 */
router.post('/pacientes',
    validate({ body: createMultiplosPacientesSchema }),
    asyncHandler(async (req: Request, res: Response) => {
        const { pacientes, password } = req.body;

        apiLogger.info('Requisição para criar múltiplos pacientes', { 
            quantidade: pacientes?.length,
            ip: req.ip 
        });

        // Verificar senha da API
        const REQUIRED_PASSWORD = process.env.API_PASSWORD;
        if (password !== REQUIRED_PASSWORD) {
            apiLogger.warn('Tentativa de acesso com senha inválida', { ip: req.ip });
            throw new AppError('Senha inválida. Acesso negado.', 403);
        }

        await PacienteService.createMultiplosPacientes(pacientes);

        const response: ApiResponse = {
            success: true,
            message: 'Pacientes criados com sucesso',
            timestamp: new Date().toISOString()
        };

        apiLogger.info('Múltiplos pacientes criados com sucesso', { 
            quantidade: pacientes.length 
        });

        res.status(201).json(response);
    })
);

/**
 * PUT /pacientes/:id - Atualiza um paciente
 */
router.put('/pacientes/:id',
    validate({
        params: pacienteParamsSchema,
        body: updatePacienteSchema
    }),
    asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);

        apiLogger.info('Requisição para atualizar paciente', { 
            id,
            dados: req.body,
            ip: req.ip 
        });

        const paciente = await PacienteService.updatePaciente(id, req.body);

        const response: ApiResponse = {
            success: true,
            message: 'Paciente atualizado com sucesso',
            data: paciente,
            timestamp: new Date().toISOString()
        };

        apiLogger.info('Paciente atualizado com sucesso', { 
            id, 
            nome: paciente.nome 
        });

        res.status(200).json(response);
    })
);

/**
 * DELETE /pacientes/:id - Remove um paciente
 */
router.delete('/pacientes/:id',
    validateParams(pacienteParamsSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);

        apiLogger.info('Requisição para deletar paciente', { 
            id,
            ip: req.ip 
        });

        await PacienteService.deletePaciente(id);

        const response: ApiResponse = {
            success: true,
            message: 'Paciente deletado com sucesso',
            timestamp: new Date().toISOString()
        };

        apiLogger.info('Paciente deletado com sucesso', { id });

        res.status(200).json(response);
    })
);

export const pacienteController = router;
