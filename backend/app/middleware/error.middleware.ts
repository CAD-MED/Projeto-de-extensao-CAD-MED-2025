import { Request, Response, NextFunction } from 'express';
import { apiLogger } from '../../config/logger.config';
import { ApiResponse } from '../paciente/dto/paciente.dto';

export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Middleware de tratamento de erros global
 */
export const errorHandler = (
    error: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
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
        apiLogger.error('Erro interno do servidor', errorLog);
    } else {
        apiLogger.warn('Erro de cliente', errorLog);
    }

    // Resposta de erro padronizada
    const errorResponse: ApiResponse = {
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

/**
 * Middleware para capturar rotas não encontradas
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    const error = new AppError(`Rota não encontrada: ${req.method} ${req.path}`, 404);
    next(error);
};

/**
 * Wrapper para funções assíncronas que automaticamente captura erros
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
