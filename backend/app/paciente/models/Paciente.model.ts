import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../config/sequelize.config';

// Definição dos atributos do paciente
interface PacienteAttributes {
    id: number;
    idUser: string;
    nome: string;
    idade: number;
    genero: string;
    patologia: string;
    createdAt?: string;
    updatedAt?: string;
}

// Campos opcionais durante a criação de pacientes (ID auto-incremento)
interface PacienteCreationAttributes extends Optional<PacienteAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

// Modelo de paciente com Sequelize
export class Paciente extends Model<PacienteAttributes, PacienteCreationAttributes> implements PacienteAttributes {
    public id!: number;
    public idUser!: string;
    public nome!: string;
    public idade!: number;
    public genero!: string;
    public patologia!: string;
    public createdAt?: string;
    public updatedAt?: string;
}

// Definição do modelo no Sequelize
export const Pacientes = Paciente.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do paciente'
    },
    idUser: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'id_user',
        comment: 'Identificador do usuário/sessão'
    },
    nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [2, 255],
            notEmpty: true
        },
        comment: 'Nome completo do paciente'
    },
    idade: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
            min: 0,
            max: 150,
            isInt: true
        },
        comment: 'Idade do paciente em anos'
    },
    genero: {
        type: DataTypes.ENUM('M', 'F', 'Outro'),
        allowNull: false,
        comment: 'Gênero do paciente'
    },
    patologia: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 500]
        },
        comment: 'Patologia ou diagnóstico do paciente'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'created_at',
        comment: 'Data de criação do registro'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'updated_at',
        comment: 'Data da última atualização do registro'
    }
}, {
    sequelize,
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

export default Pacientes;
