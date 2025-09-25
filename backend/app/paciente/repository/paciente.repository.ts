import { Pacientes, Paciente } from '../models/Paciente.model';
import { CreationAttributes, WhereOptions, Op } from 'sequelize';
import { dbLogger } from '../../../config/logger.config';
import { AppError } from '../../middleware/error.middleware';
import { GetPacientesQuery, PaginatedResponse } from '../dto/paciente.dto';

// Helper para extrair mensagem de erro
const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Erro desconhecido';
};

class PacienteRepository {
    /**
     * Buscar todos os pacientes com paginação e filtros
     */
    public async getAll(query: GetPacientesQuery): Promise<PaginatedResponse<Paciente>> {
        try {
            dbLogger.info('Buscando pacientes', { query });

            const { page = 1, limit = 10, idUser, nome, genero, patologia } = query;
            const offset = (page - 1) * limit;

            // Construir filtros
            const where: WhereOptions = {};
            
            if (idUser) where.idUser = idUser;
            if (nome) where.nome = { [Op.like]: `%${nome}%` };
            if (genero) where.genero = genero;
            if (patologia) where.patologia = { [Op.like]: `%${patologia}%` };

            const { rows: pacientes, count: total } = await Paciente.findAndCountAll({
                where,
                limit: Number(limit),
                offset,
                order: [['createdAt', 'DESC']],
                raw: false
            });

            const totalPages = Math.ceil(total / limit);

            dbLogger.info('Pacientes encontrados', { 
                total, 
                page, 
                limit, 
                totalPages,
                filtros: where 
            });

            return {
                data: pacientes,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages
                }
            };

        } catch (error) {
            dbLogger.error('Erro ao buscar pacientes', { error: getErrorMessage(error), query });
            throw new AppError('Erro ao buscar pacientes', 500);
        }
    }

    /**
     * Buscar um paciente por ID
     */
    public async getOne(id: number): Promise<Paciente | null> {
        try {
            dbLogger.info('Buscando paciente por ID', { id });

            const paciente = await Paciente.findByPk(id);
            
            if (!paciente) {
                dbLogger.warn('Paciente não encontrado', { id });
                return null;
            }

            dbLogger.info('Paciente encontrado', { id, nome: paciente.nome });
            return paciente;

        } catch (error) {
            dbLogger.error('Erro ao buscar paciente por ID', { error: getErrorMessage(error), id });
            throw new AppError('Erro ao buscar paciente', 500);
        }
    }

    /**
     * Criar múltiplos pacientes
     */
    public async createMultiplosPacientes(pacientes: CreationAttributes<Paciente>[]): Promise<void> {
        try {
            dbLogger.info('Iniciando criação de múltiplos pacientes', { 
                quantidade: pacientes.length,
                idUser: pacientes[0]?.idUser 
            });

            if (pacientes.length === 0) {
                throw new AppError('Lista de pacientes não pode estar vazia', 400);
            }

            const idUser = pacientes[0].idUser;
            
            // Deletar registros existentes para o mesmo idUser
            const deletedCount = await Paciente.destroy({ 
                where: { idUser } 
            });

            dbLogger.info('Registros existentes removidos', { 
                idUser, 
                deletedCount 
            });

            // Criar novos pacientes
            const novosPacientes = await Paciente.bulkCreate(pacientes, {
                validate: true,
                returning: true
            });

            dbLogger.info('Pacientes criados com sucesso', { 
                quantidade: novosPacientes.length,
                idUser 
            });

        } catch (error) {
            dbLogger.error('Erro ao criar múltiplos pacientes', { 
                error: getErrorMessage(error),
                quantidade: pacientes.length 
            });

            if (error instanceof AppError) {
                throw error;
            }

            throw new AppError('Erro ao criar pacientes', 500);
        }
    }

    /**
     * Atualizar um paciente
     */
    public async updatePaciente(id: number, dados: Partial<Paciente>): Promise<Paciente | null> {
        try {
            dbLogger.info('Atualizando paciente', { id, dados });

            const [affectedRows] = await Paciente.update(dados, {
                where: { id },
                validate: true
            });

            if (affectedRows === 0) {
                dbLogger.warn('Nenhum paciente foi atualizado', { id });
                return null;
            }

            const pacienteAtualizado = await this.getOne(id);
            
            dbLogger.info('Paciente atualizado com sucesso', { 
                id, 
                nome: pacienteAtualizado?.nome 
            });

            return pacienteAtualizado;

        } catch (error) {
            dbLogger.error('Erro ao atualizar paciente', { error: getErrorMessage(error), id, dados });
            throw new AppError('Erro ao atualizar paciente', 500);
        }
    }

    /**
     * Deletar um paciente
     */
    public async deletePaciente(id: number): Promise<boolean> {
        try {
            dbLogger.info('Deletando paciente', { id });

            const deletedCount = await Paciente.destroy({
                where: { id }
            });

            const sucesso = deletedCount > 0;

            if (sucesso) {
                dbLogger.info('Paciente deletado com sucesso', { id });
            } else {
                dbLogger.warn('Nenhum paciente foi deletado', { id });
            }

            return sucesso;

        } catch (error) {
            dbLogger.error('Erro ao deletar paciente', { error: getErrorMessage(error), id });
            throw new AppError('Erro ao deletar paciente', 500);
        }
    }
}

// Exporta uma instância única do PacienteRepository
export default new PacienteRepository();
