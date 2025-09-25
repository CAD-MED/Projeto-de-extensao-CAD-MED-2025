"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pacienteParamsSchema = exports.getPacientesQuerySchema = exports.updatePacienteSchema = exports.createMultiplosPacientesSchema = exports.createPacienteSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Schema para validação de criação de paciente
exports.createPacienteSchema = joi_1.default.object({
    idUser: joi_1.default.string().required().min(1).max(255).messages({
        'string.empty': 'ID do usuário é obrigatório',
        'string.max': 'ID do usuário deve ter no máximo 255 caracteres'
    }),
    nome: joi_1.default.string().required().min(2).max(255).messages({
        'string.empty': 'Nome é obrigatório',
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 255 caracteres'
    }),
    idade: joi_1.default.number().integer().min(0).max(150).required().messages({
        'number.base': 'Idade deve ser um número',
        'number.integer': 'Idade deve ser um número inteiro',
        'number.min': 'Idade deve ser maior ou igual a 0',
        'number.max': 'Idade deve ser menor ou igual a 150'
    }),
    genero: joi_1.default.string().valid('M', 'F', 'Outro').required().messages({
        'any.only': 'Gênero deve ser M, F ou Outro'
    }),
    patologia: joi_1.default.string().required().min(1).max(500).messages({
        'string.empty': 'Patologia é obrigatória',
        'string.max': 'Patologia deve ter no máximo 500 caracteres'
    }),
    createdAt: joi_1.default.string().optional()
});
// Schema para validação de múltiplos pacientes
exports.createMultiplosPacientesSchema = joi_1.default.object({
    password: joi_1.default.string().required().messages({
        'string.empty': 'Senha é obrigatória'
    }),
    pacientes: joi_1.default.array().items(exports.createPacienteSchema).min(1).required().messages({
        'array.min': 'Deve haver pelo menos um paciente na lista',
        'array.base': 'Pacientes deve ser uma lista'
    })
});
// Schema para validação de atualização de paciente
exports.updatePacienteSchema = joi_1.default.object({
    nome: joi_1.default.string().min(2).max(255).optional(),
    idade: joi_1.default.number().integer().min(0).max(150).optional(),
    genero: joi_1.default.string().valid('M', 'F', 'Outro').optional(),
    patologia: joi_1.default.string().min(1).max(500).optional()
}).min(1).messages({
    'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});
// Schema para validação de query parameters
exports.getPacientesQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).optional().default(1),
    limit: joi_1.default.number().integer().min(1).max(100).optional().default(10),
    idUser: joi_1.default.string().max(255).optional(),
    nome: joi_1.default.string().max(255).optional(),
    genero: joi_1.default.string().valid('M', 'F', 'Outro').optional(),
    patologia: joi_1.default.string().max(500).optional()
});
// Schema para validação de parâmetros de rota
exports.pacienteParamsSchema = joi_1.default.object({
    id: joi_1.default.number().integer().min(1).required().messages({
        'number.base': 'ID deve ser um número',
        'number.integer': 'ID deve ser um número inteiro',
        'number.min': 'ID deve ser maior que 0'
    })
});
