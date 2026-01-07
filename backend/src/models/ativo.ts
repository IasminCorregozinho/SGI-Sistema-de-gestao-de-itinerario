export interface Ativo {
    id?: number;
    patrimonio: string;
    id_tipo_ativo: number;
    id_status: number;
    id_localizacao: number;
    id_responsavel: number;
    marca_modelo?: string;
    data_aquisicao?: Date;
    info_tecnicas?: string;
    obs?: string;

    // Campos virtuais (joins)
    tipo_ativo_nome?: string;
    status_nome?: string;
    localizacao_nome?: string;
    responsavel_nome?: string;
}

// interface para o Histórico
export interface HistoricoAtivo {
    ativo_id: number;
    usuario_alteracao: number;
    status_anterior: number | null;
    status_novo: number;
    localizacao_anterior: number | null;
    localizacao_novo: number;
    responsavel_anterior: number | null;
    responsavel_novo: number;
    observacao: string;
}