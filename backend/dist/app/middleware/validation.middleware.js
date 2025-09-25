"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateBody = exports.validate = void 0;
const logger_config_1 = require("../../config/logger.config");
/**
 * Middleware de validação usando Joi
 * @param schemas - Schemas de validação para diferentes partes da requisição
 */
const validate = (schemas) => {
    return (req, res, next) => {
        const errors = [];
        // Validar body
        if (schemas.body) {
            const { error } = schemas.body.validate(req.body, { abortEarly: false });
            if (error) {
                const bodyErrors = error.details.map(detail => `Body: ${detail.message}`);
                errors.push(...bodyErrors);
                logger_config_1.validationLogger.warn('Erro de validação no body', {
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
                logger_config_1.validationLogger.warn('Erro de validação nos parâmetros', {
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
                logger_config_1.validationLogger.warn('Erro de validação na query', {
                    errors: queryErrors,
                    query: req.query,
                    endpoint: req.path
                });
            }
            else {
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
                logger_config_1.validationLogger.warn('Erro de validação nos headers', {
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
        logger_config_1.validationLogger.debug('Validação bem-sucedida', {
            endpoint: req.path,
            method: req.method
        });
        next();
    };
};
exports.validate = validate;
/**
 * Middleware de validação apenas para body
 */
const validateBody = (schema) => {
    return (0, exports.validate)({ body: schema });
};
exports.validateBody = validateBody;
/**
 * Middleware de validação apenas para params
 */
const validateParams = (schema) => {
    return (0, exports.validate)({ params: schema });
};
exports.validateParams = validateParams;
/**
 * Middleware de validação apenas para query
 */
const validateQuery = (schema) => {
    return (0, exports.validate)({ query: schema });
};
exports.validateQuery = validateQuery;
