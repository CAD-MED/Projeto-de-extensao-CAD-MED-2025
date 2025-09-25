"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationLogger = exports.authLogger = exports.apiLogger = exports.dbLogger = exports.createModuleLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Definir formato personalizado para logs
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf((_a) => {
    var { timestamp, level, message, stack, service } = _a, meta = __rest(_a, ["timestamp", "level", "message", "stack", "service"]);
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
}));
// Configurar transports baseado no ambiente
const transports = [];
// Console transport (sempre ativo)
transports.push(new winston_1.default.transports.Console({
    format: winston_1.default.format.combine(winston_1.default.format.colorize(), logFormat)
}));
// File transports (apenas em produção ou quando especificado)
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_FILE_LOGS === 'true') {
    const logsDir = path_1.default.join(process.cwd(), 'logs');
    // Log de erros
    transports.push(new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'error.log'),
        level: 'error',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5
    }));
    // Log combinado
    transports.push(new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'combined.log'),
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5
    }));
}
// Criar logger principal
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'cadmed-api' },
    transports,
    // Não sair do processo em caso de exceção não tratada
    exitOnError: false
});
// Capturar exceções não tratadas
logger.exceptions.handle(new winston_1.default.transports.Console({
    format: winston_1.default.format.combine(winston_1.default.format.colorize(), logFormat)
}));
// Capturar promise rejections não tratadas
logger.rejections.handle(new winston_1.default.transports.Console({
    format: winston_1.default.format.combine(winston_1.default.format.colorize(), logFormat)
}));
// Criar loggers específicos para diferentes módulos
const createModuleLogger = (moduleName) => {
    return logger.child({ service: `cadmed-api:${moduleName}` });
};
exports.createModuleLogger = createModuleLogger;
// Logger específicos
exports.dbLogger = (0, exports.createModuleLogger)('database');
exports.apiLogger = (0, exports.createModuleLogger)('api');
exports.authLogger = (0, exports.createModuleLogger)('auth');
exports.validationLogger = (0, exports.createModuleLogger)('validation');
exports.default = logger;
