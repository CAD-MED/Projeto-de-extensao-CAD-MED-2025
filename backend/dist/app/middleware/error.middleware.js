"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
const logger_config_1 = require("../../config/logger.config");
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Middleware de tratamento de erros global
 */
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Erro interno do servidor';
    let isOperational = false;
    // Se é um erro conhecido (AppError)
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        isOperational = error.isOperational;
    }
    // Log do erro
    const errorLog = {
        message: error.message,
        statusCode,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    };
    if (statusCode >= 500) {
        logger_config_1.apiLogger.error('Erro interno do servidor', errorLog);
    }
    else {
        logger_config_1.apiLogger.warn('Erro de cliente', errorLog);
    }
    // Resposta de erro padronizada
    const errorResponse = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };
    // Em desenvolvimento, incluir stack trace
    if (process.env.NODE_ENV === 'development') {
        errorResponse.error = {
            stack: error.stack,
            details: error.message
        };
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
/**
 * Middleware para capturar rotas não encontradas
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Rota não encontrada: ${req.method} ${req.path}`, 404);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
/**
 * Wrapper para funções assíncronas que automaticamente captura erros
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
