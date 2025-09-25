"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const app_module_1 = require("./app/app.module");
const cors_1 = __importDefault(require("cors"));
const logger_config_1 = __importStar(require("./config/logger.config"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Configurar CORS
app.use((0, cors_1.default)({
    origin: ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',')) || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Inicializar módulos da aplicação
(0, app_module_1.AppModule)(app);
// Inicializar servidor
const server = app.listen(port, () => {
    logger_config_1.apiLogger.info('Servidor CAD-MED iniciado com sucesso', {
        port,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
    });
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`📖 API Documentation: http://localhost:${port}/api-docs`);
    console.log(`❤️  Health Check: http://localhost:${port}/health`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_config_1.apiLogger.info('Recebido sinal SIGTERM, iniciando shutdown graceful');
    server.close(() => {
        logger_config_1.apiLogger.info('Servidor HTTP fechado');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_config_1.apiLogger.info('Recebido sinal SIGINT, iniciando shutdown graceful');
    server.close(() => {
        logger_config_1.apiLogger.info('Servidor HTTP fechado');
        process.exit(0);
    });
});
// Tratar exceções não capturadas
process.on('uncaughtException', (error) => {
    logger_config_1.default.error('Exceção não capturada', { error: error.message, stack: error.stack });
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_config_1.default.error('Promise rejection não tratada', { reason, promise });
    process.exit(1);
});
