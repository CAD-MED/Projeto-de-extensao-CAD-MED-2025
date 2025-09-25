import PacienteRepository from '../repository/paciente.repository';
import { Paciente } from '../models/Paciente.model';
import { 
    CreatePacienteRequest, 
    UpdatePacienteRequest, 
    GetPacientesQuery, 
    PaginatedResponse 
} from '../dto/paciente.dto';
import { apiLogger } from '../../../config/logger.config';
import { AppError } from '../../middleware/error.middleware';

// Helper para extrair mensagem de erro
const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Erro desconhecido';
};

class PacienteService {
    /**
     * Buscar todos os pacientes com paginação e filtros
     */
    public async getAllPacientes(query: GetPacientesQuery): Promise<PaginatedResponse<Paciente>> {
        try {
            apiLogger.info('Iniciando busca de pacientes', { query });

            const resultado = await PacienteRepository.getAll(query);

            apiLogger.info('Busca de pacientes concluída', { 
                total: resultado.pagination.total,
                pagina: resultado.pagination.page 
            });

            return resultado;

        } catch (error) {
            apiLogger.error('Erro no serviço ao buscar pacientes', { 
                error: getErrorMessage(error),
                query 
            });

            if (error instanceof AppError) {
                throw error;
            }

            throw new AppError('Erro ao buscar pacientes', 500);
        }
    }

    /**
     * Buscar um paciente por ID
     */
    public async getPacienteById(id: number): Promise<Paciente> {
        try {
            apiLogger.info('Buscando paciente por ID', { id });

            if (!id || id <= 0) {
                throw new AppError('ID do paciente inválido', 400);
            }

            const paciente = await PacienteRepository.getOne(id);

            if (!paciente) {
                throw new AppError('Paciente não encontrado', 404);
            }

            apiLogger.info('Paciente encontrado', { 
                id, 
                nome: paciente.nome 
            });

            return paciente;

        } catch (error) {
            apiLogger.error('Erro no serviço ao buscar paciente por ID', { 
                error: getErrorMessage(error),
                id 
            });

            if (error instanceof AppError) {
                throw error;
            }

            throw new AppError('Erro ao buscar paciente', 500);
        }
    }

    /**
     * Criar múltiplos pacientes
     */
    public async createMultiplosPacientes(pacientes: CreatePacienteRequest[]): Promise<void> {
        try {
            apiLogger.info('Iniciando criação de múltiplos pacientes', { 
                quantidade: pacientes.length 
            });

            // Validações de regra de negócio
            if (!pacientes || pacientes.length === 0) {
                throw new AppError('Lista de pacientes não pode estar vazia', 400);
            }

            // Verificar se todos os pacientes têm o mesmo idUser
            const idUser = pacientes[0].idUser;
            const todosComMesmoIdUser = pacientes.every(p => p.idUser === idUser);

            if (!todosComMesmoIdUser) {
                throw new AppError('Todos os pacientes devem ter o mesmo idUser', 400);
            }

            // Transformar dados se necessário
            const dadosPacientes = pacientes.map(p => ({
                ...p,
                createdAt: p.createdAt || new Date().toISOString()
            }));

            await PacienteRepository.createMultiplosPacientes(dadosPacientes);

            apiLogger.info('Múltiplos pacientes criados com sucesso', { 
                quantidade: pacientes.length,
                idUser 
            });

        } catch (error) {
            apiLogger.error('Erro no serviço ao criar múltiplos pacientes', { 
                error: getErrorMessage(error),
                quantidade: pacientes?.length 
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
    public async updatePaciente(id: number, dados: UpdatePacienteRequest): Promise<Paciente> {
        try {
            apiLogger.info('Atualizando paciente', { id, dados });

            if (!id || id <= 0) {
                throw new AppError('ID do paciente inválido', 400);
            }

            // Verificar se o paciente existe
            await this.getPacienteById(id);

            const pacienteAtualizado = await PacienteRepository.updatePaciente(id, {
                ...dados,
                updatedAt: new Date().toISOString()
            });

            if (!pacienteAtualizado) {
                throw new AppError('Falha ao atualizar paciente', 500);
            }

            apiLogger.info('Paciente atualizado com sucesso', { 
                id, 
                nome: pacienteAtualizado.nome 
            });

            return pacienteAtualizado;

        } catch (error) {
            apiLogger.error('Erro no serviço ao atualizar paciente', { 
                error: getErrorMessage(error),
                id,
                dados 
            });

            if (error instanceof AppError) {
                throw error;
            }

            throw new AppError('Erro ao atualizar paciente', 500);
        }
    }

    /**
     * Deletar um paciente
     */
    public async deletePaciente(id: number): Promise<void> {
        try {
            apiLogger.info('Deletando paciente', { id });

            if (!id || id <= 0) {
                throw new AppError('ID do paciente inválido', 400);
            }

            // Verificar se o paciente existe
            await this.getPacienteById(id);

            const deletado = await PacienteRepository.deletePaciente(id);

            if (!deletado) {
                throw new AppError('Falha ao deletar paciente', 500);
            }

            apiLogger.info('Paciente deletado com sucesso', { id });

        } catch (error) {
            apiLogger.error('Erro no serviço ao deletar paciente', { 
                error: getErrorMessage(error),
                id 
            });

            if (error instanceof AppError) {
                throw error;
            }

            throw new AppError('Erro ao deletar paciente', 500);
        }
    }
}

export default new PacienteService();
