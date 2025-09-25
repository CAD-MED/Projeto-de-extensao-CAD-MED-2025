"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = exports.User = void 0;
const sequelize_1 = require("sequelize");
const sequelize_config_1 = __importDefault(require("./../../../config/sequelize.config"));
// Modelo de usuário com Sequelize
class User extends sequelize_1.Model {
}
exports.User = User;
// Definição do modelo no Sequelize
exports.Users = User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    idUser: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    nome: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    idade: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    genero: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    patologia: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    createdAt: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true, // Permite inserção manual de data
        // defaultValue: DataTypes.NOW
    },
}, {
    sequelize: sequelize_config_1.default,
    tableName: 'users',
    timestamps: false, // Desabilita timestamps automáticos do Sequelize
});
exports.default = exports.Users;
