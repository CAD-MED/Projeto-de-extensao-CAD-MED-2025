import 'dotenv/config';
import express from 'express';
import { AppModule } from './app/app.module';
import cors from 'cors';
import logger, { apiLogger } from './config/logger.config';

const app = express();
const port = process.env.PORT || 3000;

// Configurar CORS
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Inicializar módulos da aplicação
AppModule(app);

// Inicializar servidor
const server = app.listen(port, () => {
    apiLogger.info('Servidor CAD-MED iniciado com sucesso', {
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
    apiLogger.info('Recebido sinal SIGTERM, iniciando shutdown graceful');
    
    server.close(() => {
        apiLogger.info('Servidor HTTP fechado');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    apiLogger.info('Recebido sinal SIGINT, iniciando shutdown graceful');
    
    server.close(() => {
        apiLogger.info('Servidor HTTP fechado');
        process.exit(0);
    });
});

// Tratar exceções não capturadas
process.on('uncaughtException', (error) => {
    logger.error('Exceção não capturada', { error: error.message, stack: error.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Promise rejection não tratada', { reason, promise });
    process.exit(1);
});
