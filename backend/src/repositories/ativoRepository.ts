import { pool } from '../config/db';
import { Ativo, HistoricoAtivo } from '../models/ativo';

// Buscar um ativo pelo ID
export async function buscarPorId(id: number): Promise<Ativo | null> {
    const result = await pool.query('SELECT * FROM ATIVO WHERE ativo_id = $1', [id]);

    // Mapear o retorno do banco 
    if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
            id: row.ativo_id,
            patrimonio: row.patrimonio,
            id_tipo_ativo: row.tipo_ativo,
            id_status: row.status,
            id_localizacao: row.localizacao,
            id_responsavel: row.responsavel,
            marca_modelo: row.marca_modelo,
            obs: row.observacoes
        } as Ativo;
    }
    return null;
    return null;
}

// Buscar um ativo pelo Patrimônio
export async function buscarPorPatrimonio(patrimonio: string): Promise<Ativo | null> {
    const result = await pool.query('SELECT * FROM ATIVO WHERE patrimonio = $1', [patrimonio]);

    if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
            id: row.ativo_id,
            patrimonio: row.patrimonio
        } as Ativo;
    }
    return null;
}

// Buscar todos os ativos
export async function buscarTodos(): Promise<Ativo[]> {
    const query = `
        SELECT 
            a.*, 
            s.descricao as status_nome,
            t.descricao as tipo_ativo_nome,
            COALESCE(l.setor_sala, l.reitoria, 'Sem Nome') as localizacao_nome,
            r.nome as responsavel_nome
        FROM ATIVO a
        LEFT JOIN STATUS_ATIVO s ON a.status = s.status_id
        LEFT JOIN TIPO_ATIVO t ON a.tipo_ativo = t.tipo_ativo_id
        LEFT JOIN localizacao_ativo l ON a.localizacao = l.localizacao_id
        LEFT JOIN RESPONSAVEL r ON a.responsavel = r.responsavel_id
    `;
    const result = await pool.query(query);

    return result.rows.map(row => ({
        id: row.ativo_id,
        patrimonio: row.patrimonio,
        id_tipo_ativo: row.tipo_ativo,
        id_status: row.status,
        id_localizacao: row.localizacao,
        id_responsavel: row.responsavel,
        marca_modelo: row.marca_modelo,
        obs: row.observacoes,
        // Campos extras
        status_nome: row.status_nome,
        tipo_ativo_nome: row.tipo_ativo_nome,
        localizacao_nome: row.localizacao_nome,
        responsavel_nome: row.responsavel_nome
    } as Ativo));
}

// Criar novo ativo
export async function criar(ativo: Ativo): Promise<Ativo> {
    const query = `
        INSERT INTO ATIVO (patrimonio, tipo_ativo, status, localizacao, responsavel, marca_modelo, observacoes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const values = [ativo.patrimonio, ativo.id_tipo_ativo, ativo.id_status, ativo.id_localizacao, ativo.id_responsavel, ativo.marca_modelo, ativo.obs];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Atualizar ativo existente
export async function atualizar(id: number, ativo: Ativo): Promise<Ativo> {
    const query = `
        UPDATE ATIVO SET 
            tipo_ativo = $1, status = $2, localizacao = $3, responsavel = $4, patrimonio = $5, marca_modelo = $6, observacoes = $7
        WHERE ativo_id = $8 RETURNING *
    `;
    const values = [ativo.id_tipo_ativo, ativo.id_status, ativo.id_localizacao, ativo.id_responsavel, ativo.patrimonio, ativo.marca_modelo, ativo.obs, id];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Inserir histórico
export async function registrarHistorico(hist: HistoricoAtivo): Promise<void> {
    const query = `
        INSERT INTO historico_ativo (
            ativo_id, data_movimentacao, usuario_alteracao, 
            status_anterior, status_novo,
            localizacao_anterior, localizacao_novo,
            responsavel_anterior, responsavel_novo, observacao, valor_manutencao
        ) VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    await pool.query(query, [
        hist.ativo_id, hist.usuario_alteracao,
        hist.status_anterior, hist.status_novo,
        hist.localizacao_anterior, hist.localizacao_novo,
        hist.responsavel_anterior, hist.responsavel_novo,
        hist.observacao,
        hist.valor_manutencao || null
    ]);
}

// FUNÇÃO DO DASHBOARD 
export async function obterDadosDashboard() {

    const query = `
        SELECT 
            COUNT(*)::int as total,
            COALESCE(SUM(CASE WHEN status = 15 THEN 1 ELSE 0 END), 0)::int as estoque,
            COALESCE(SUM(CASE WHEN status = 14 THEN 1 ELSE 0 END), 0)::int as manutencao,
            COALESCE(SUM(CASE WHEN status = 16 THEN 1 ELSE 0 END), 0)::int as descartados
        FROM ATIVO
    `;

    try {
        const result = await pool.query(query);
        return result.rows[0];
    } catch (error) {
        console.error('Erro ao buscar estatísticas do dashboard:', error);
        throw error;
    }
}

export async function obterContagemPorCategoria() {
    const query = `
        SELECT t.descricao as categoria, COUNT(*) as quantidade
        FROM ATIVO a
        JOIN TIPO_ATIVO t ON a.tipo_ativo = t.tipo_ativo_id
        GROUP BY t.descricao
        ORDER BY quantidade DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
}

export async function obterMovimentacoesRecentes() {
    const query = `
        SELECT 
            a.patrimonio as ativo,      
            r.nome as usuario,
            CASE 
                WHEN h.status_anterior IS NULL THEN 'Cadastro'
                WHEN h.status_novo = h.status_anterior THEN 'Edição'
                ELSE s.descricao 
            END as acao,       
            h.data_movimentacao as data
        FROM historico_ativo h
        INNER JOIN ATIVO a ON h.ativo_id = a.ativo_id
        INNER JOIN STATUS_ATIVO s ON h.status_novo = s.status_id
        LEFT JOIN RESPONSAVEL r ON h.usuario_alteracao = r.responsavel_id
        ORDER BY h.data_movimentacao DESC
        LIMIT 5
    `;

    const result = await pool.query(query);
    return result.rows;
}

// Buscar todos os status disponíveis
export async function buscarStatus() {
    const result = await pool.query('SELECT * FROM STATUS_ATIVO');
    return result.rows; // { status_id, descricao }
}

// Buscar todas as localizações disponíveis
export async function buscarLocalizacoes() {
    const result = await pool.query(`
        SELECT localizacao_id, COALESCE(setor_sala, reitoria, 'Sem Nome') as setor_sala, reitoria 
        FROM localizacao_ativo
    `);
    return result.rows; // { localizacao_id, setor_sala, reitoria }
}

// Buscar todos os tipos de ativo
export async function buscarTiposAtivo() {
    const result = await pool.query('SELECT * FROM tipo_ativo');
    return result.rows; // { tipo_ativo_id, descricao }
}

// Buscar histórico de um ativo
export async function buscarHistoricoPorAtivoId(id: number) {
    const query = `
        SELECT 
            h.data_movimentacao,
            h.usuario_alteracao,
            r.nome as responsavel,
            -- Lógica para determinar o tipo de ação basica
            CASE 
                WHEN h.status_anterior IS NULL THEN 'Cadastro'
                WHEN h.status_novo != h.status_anterior AND h.localizacao_novo != h.localizacao_anterior THEN 'Edição Completa'
                WHEN h.status_novo != h.status_anterior THEN 'Mudança de Status'
                WHEN h.localizacao_novo != h.localizacao_anterior THEN 'Mudança de Local'
                WHEN h.responsavel_novo != h.responsavel_anterior THEN 'Mudança de Resp.'
                ELSE 'Edição'
            END as tipo_acao,
            h.observacao,
            -- Detalhes extras
            s1.descricao as status_anterior_nome,
            s2.descricao as status_novo_nome,
            COALESCE(l1.setor_sala, l1.reitoria, 'Sem Local') as localizacao_anterior_nome,
            COALESCE(l2.setor_sala, l2.reitoria, 'Sem Local') as localizacao_novo_nome,
            r_ant.nome as responsavel_anterior_nome,
            r_nov.nome as responsavel_novo_nome,
            h.valor_manutencao
        FROM historico_ativo h
        LEFT JOIN RESPONSAVEL r ON h.usuario_alteracao = r.responsavel_id
        LEFT JOIN STATUS_ATIVO s1 ON h.status_anterior = s1.status_id
        LEFT JOIN STATUS_ATIVO s2 ON h.status_novo = s2.status_id
        LEFT JOIN localizacao_ativo l1 ON h.localizacao_anterior = l1.localizacao_id
        LEFT JOIN localizacao_ativo l2 ON h.localizacao_novo = l2.localizacao_id
        LEFT JOIN RESPONSAVEL r_ant ON h.responsavel_anterior = r_ant.responsavel_id
        LEFT JOIN RESPONSAVEL r_nov ON h.responsavel_novo = r_nov.responsavel_id
        WHERE h.ativo_id = $1
        ORDER BY h.data_movimentacao DESC
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
}