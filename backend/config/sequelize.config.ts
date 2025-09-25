import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { dbLogger } from './logger.config';

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

// Verifica se as variáveis de ambiente obrigatórias estão definidas
const requiredEnvVars = ['DB_NAME', 'DB_USERNAME', 'DB_PASSWORD', 'DB_HOST'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    const error = `Variáveis de ambiente obrigatórias ausentes: ${missingVars.join(', ')}`;
    console.error(error);
    throw new Error(error);
}

// Configuração do Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME!,
    process.env.DB_USERNAME!,
    process.env.DB_PASSWORD!,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: Number(process.env.DB_PORT) || 3306,
        pool: {
            max: Number(process.env.DB_CONNECTION_LIMIT) || 10,
            min: 0,
            acquire: 60000, // Tempo máximo para obter conexão
            idle: 30000,    // Tempo máximo para conexão ficar inativa
            evict: 1000     // Tempo para remover conexões inválidas
        },
        // Logging customizado usando Winston
        logging: (sql: string, timing?: number) => {
            if (process.env.NODE_ENV === 'development' || process.env.LOG_SQL === 'true') {
                dbLogger.debug('SQL Query executada', { 
                    sql: sql.substring(0, 500), // Limitar tamanho do log
                    timing 
                });
            }
        },
        // Configurações de performance
        define: {
            timestamps: true,
            underscored: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        },
        // Configurações de retry
        retry: {
            match: [
                /ETIMEDOUT/,
                /EHOSTUNREACH/,
                /ECONNRESET/,
                /ECONNREFUSED/,
                /ETIMEDOUT/,
                /ESOCKETTIMEDOUT/,
                /EHOSTUNREACH/,
                /EPIPE/,
                /EAI_AGAIN/,
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/
            ],
            max: 3
        },
        // Timezone configuration
        timezone: '-03:00' // Brasília timezone
    }
);

// Testar conexão no startup
sequelize.authenticate()
    .then(() => {
        dbLogger.info('Conexão com banco de dados estabelecida com sucesso', {
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306
        });
    })
    .catch((error: Error) => {
        dbLogger.error('Erro ao conectar com banco de dados', { 
            error: error.message,
            database: process.env.DB_NAME,
            host: process.env.DB_HOST
        });
    });

export default sequelize;
