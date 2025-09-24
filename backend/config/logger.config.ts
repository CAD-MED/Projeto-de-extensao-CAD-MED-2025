import winston from 'winston';
import path from 'path';

// Definir formato personalizado para logs
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, service, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]`;
        
        if (service) {
            log += ` [${service}]`;
        }
        
        log += `: ${message}`;
        
        // Adicionar metadados se existirem
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }
        
        // Adicionar stack trace se for um erro
        if (stack) {
            log += `\n${stack}`;
        }
        
        return log;
    })
);

// Configurar transports baseado no ambiente
const transports = [];

// Console transport (sempre ativo)
transports.push(
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            logFormat
        )
    })
);

// File transports (apenas em produção ou quando especificado)
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_FILE_LOGS === 'true') {
    const logsDir = path.join(process.cwd(), 'logs');
    
    // Log de erros
    transports.push(
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            format: logFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    );
    
    // Log combinado
    transports.push(
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            format: logFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    );
}

// Criar logger principal
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'cadmed-api' },
    transports,
    // Não sair do processo em caso de exceção não tratada
    exitOnError: false
});

// Capturar exceções não tratadas
logger.exceptions.handle(
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            logFormat
        )
    })
);

// Capturar promise rejections não tratadas
logger.rejections.handle(
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            logFormat
        )
    })
);

// Criar loggers específicos para diferentes módulos
export const createModuleLogger = (moduleName: string) => {
    return logger.child({ service: `cadmed-api:${moduleName}` });
};

// Logger específicos
export const dbLogger = createModuleLogger('database');
export const apiLogger = createModuleLogger('api');
export const authLogger = createModuleLogger('auth');
export const validationLogger = createModuleLogger('validation');

export default logger;
