import Joi from 'joi';

// Schema para validação de criação de paciente
export const createPacienteSchema = Joi.object({
    idUser: Joi.string().required().min(1).max(255).messages({
        'string.empty': 'ID do usuário é obrigatório',
        'string.max': 'ID do usuário deve ter no máximo 255 caracteres'
    }),
    nome: Joi.string().required().min(2).max(255).messages({
        'string.empty': 'Nome é obrigatório',
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 255 caracteres'
    }),
    idade: Joi.number().integer().min(0).max(150).required().messages({
        'number.base': 'Idade deve ser um número',
        'number.integer': 'Idade deve ser um número inteiro',
        'number.min': 'Idade deve ser maior ou igual a 0',
        'number.max': 'Idade deve ser menor ou igual a 150'
    }),
    genero: Joi.string().valid('M', 'F', 'Outro').required().messages({
        'any.only': 'Gênero deve ser M, F ou Outro'
    }),
    patologia: Joi.string().required().min(1).max(500).messages({
        'string.empty': 'Patologia é obrigatória',
        'string.max': 'Patologia deve ter no máximo 500 caracteres'
    }),
    createdAt: Joi.string().optional()
});

// Schema para validação de múltiplos pacientes
/*export const createMultiplosPacientesSchema = Joi.object({
    password: Joi.string().required().messages({
        'string.empty': 'Senha é obrigatória'
    }),
    pacientes: Joi.array().items(createPacienteSchema).min(1).required().messages({
        'array.min': 'Deve haver pelo menos um paciente na lista',
        'array.base': 'Pacientes deve ser uma lista'
    })
});*/

// Schema para validação de atualização de paciente
export const updatePacienteSchema = Joi.object({
    nome: Joi.string().min(2).max(255).optional(),
    idade: Joi.number().integer().min(0).max(150).optional(),
    genero: Joi.string().valid('M', 'F', 'Outro').optional(),
    patologia: Joi.string().min(1).max(500).optional()
}).min(1).messages({
    'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

// Schema para validação de query parameters
export const getPacientesQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(10),
    idUser: Joi.string().max(255).optional(),
    nome: Joi.string().max(255).optional(),
    genero: Joi.string().valid('M', 'F', 'Outro').optional(),
    patologia: Joi.string().max(500).optional()
});

// Schema para validação de parâmetros de rota
export const pacienteParamsSchema = Joi.object({
    id: Joi.number().integer().min(1).required().messages({
        'number.base': 'ID deve ser um número',
        'number.integer': 'ID deve ser um número inteiro',
        'number.min': 'ID deve ser maior que 0'
    })
});
