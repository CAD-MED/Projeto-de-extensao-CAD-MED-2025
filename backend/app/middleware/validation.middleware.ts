import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validationLogger } from '../../config/logger.config';

export interface ValidationOptions {
    body?: Joi.ObjectSchema;
    params?: Joi.ObjectSchema;
    query?: Joi.ObjectSchema;
    headers?: Joi.ObjectSchema;
}

/**
 * Middleware de validação usando Joi
 * @param schemas - Schemas de validação para diferentes partes da requisição
 */
export const validate = (schemas: ValidationOptions) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const errors: string[] = [];

        // Validar body
        if (schemas.body) {
            const { error } = schemas.body.validate(req.body, { abortEarly: false });
            if (error) {
                const bodyErrors = error.details.map(detail => `Body: ${detail.message}`);
                errors.push(...bodyErrors);
                validationLogger.warn('Erro de validação no body', { 
                    errors: bodyErrors, 
                    body: req.body,
                    endpoint: req.path 
                });
            }
        }

        // Validar params
        if (schemas.params) {
            const { error } = schemas.params.validate(req.params, { abortEarly: false });
            if (error) {
                const paramErrors = error.details.map(detail => `Params: ${detail.message}`);
                errors.push(...paramErrors);
                validationLogger.warn('Erro de validação nos parâmetros', { 
                    errors: paramErrors, 
                    params: req.params,
                    endpoint: req.path 
                });
            }
        }

        // Validar query
        if (schemas.query) {
            const { error, value } = schemas.query.validate(req.query, { abortEarly: false });
            if (error) {
                const queryErrors = error.details.map(detail => `Query: ${detail.message}`);
                errors.push(...queryErrors);
                validationLogger.warn('Erro de validação na query', { 
                    errors: queryErrors, 
                    query: req.query,
                    endpoint: req.path 
                });
            } else {
                // Aplicar valores padrão da validação
                req.query = value;
            }
        }

        // Validar headers
        if (schemas.headers) {
            const { error } = schemas.headers.validate(req.headers, { abortEarly: false });
            if (error) {
                const headerErrors = error.details.map(detail => `Headers: ${detail.message}`);
                errors.push(...headerErrors);
                validationLogger.warn('Erro de validação nos headers', { 
                    errors: headerErrors, 
                    endpoint: req.path 
                });
            }
        }

        // Se há erros, retornar resposta de erro
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Dados de entrada inválidos',
                errors,
                timestamp: new Date().toISOString()
            });
        }

        validationLogger.debug('Validação bem-sucedida', { 
            endpoint: req.path,
            method: req.method 
        });

        next();
    };
};

/**
 * Middleware de validação apenas para body
 */
export const validateBody = (schema: Joi.ObjectSchema) => {
    return validate({ body: schema });
};

/**
 * Middleware de validação apenas para params
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
    return validate({ params: schema });
};

/**
 * Middleware de validação apenas para query
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
    return validate({ query: schema });
};
