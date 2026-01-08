// interface para o Ativo
// Este arquivo define os "contratos" de dados para os Ativos e seus Históricos.
// Ele garante que o objeto que o backend envia seja o mesmo que o frontend espera receber.

// Interface Principal do Ativo: Representa a estrutura completa de um equipamento de TI no sistema.
// É usada tanto para listagem quanto para o formulário de cadastro/edição.
 
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
    // Valor monetário associado, usado principalmente se houver custo de manutenção.
    valor_manutencao?: number; 
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
    valor_manutencao?: number;
}