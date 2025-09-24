// DTOs para requisições e respostas relacionadas a pacientes

export interface CreatePacienteRequest {
    idUser: string;
    nome: string;
    idade: number;
    genero: 'M' | 'F' | 'Outro';
    patologia: string;
    createdAt?: string;
}

export interface CreateMultiplosPacientesRequest {
    password: string;
    pacientes: CreatePacienteRequest[];
}

export interface PacienteResponse {
    id: number;
    idUser: string;
    nome: string;
    idade: number;
    genero: string;
    patologia: string;
    createdAt?: string;
}

export interface UpdatePacienteRequest {
    nome?: string;
    idade?: number;
    genero?: 'M' | 'F' | 'Outro';
    patologia?: string;
}

export interface GetPacientesQuery {
    page?: number;
    limit?: number;
    idUser?: string;
    nome?: string;
    genero?: string;
    patologia?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
    timestamp?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
