"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pacientes = exports.Paciente = void 0;
const sequelize_1 = require("sequelize");
const sequelize_config_1 = __importDefault(require("../../../config/sequelize.config"));
// Modelo de paciente com Sequelize
class Paciente extends sequelize_1.Model {
}
exports.Paciente = Paciente;
// Definição do modelo no Sequelize
exports.Pacientes = Paciente.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do paciente'
    },
    idUser: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        field: 'id_user',
        comment: 'Identificador do usuário/sessão'
    },
    nome: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [2, 255],
            notEmpty: true
        },
        comment: 'Nome completo do paciente'
    },
    idade: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
            min: 0,
            max: 150,
            isInt: true
        },
        comment: 'Idade do paciente em anos'
    },
    genero: {
        type: sequelize_1.DataTypes.ENUM('M', 'F', 'Outro'),
        allowNull: false,
        comment: 'Gênero do paciente'
    },
    patologia: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 500]
        },
        comment: 'Patologia ou diagnóstico do paciente'
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: 'created_at',
        comment: 'Data de criação do registro'
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: 'updated_at',
        comment: 'Data da última atualização do registro'
    }
}, {
    sequelize: sequelize_config_1.default,
    tableName: 'pacientes',
    timestamps: true,
    underscored: true, // Usar snake_case para nomes de colunas
    indexes: [
        {
            fields: ['id_user']
        },
        {
            fields: ['nome']
        },
        {
            fields: ['genero']
        },
        {
            fields: ['created_at']
        }
    ],
    comment: 'Tabela de pacientes do sistema CAD-MED'
});
exports.default = exports.Pacientes;
