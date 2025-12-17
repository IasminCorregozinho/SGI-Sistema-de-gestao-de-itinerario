// Apenas comandos SQL 

import { pool } from '../config/db';
import { Ativo, HistoricoAtivo } from '../models/ativo';

// Buscar um ativo pelo ID
export async function findById(id: number): Promise<Ativo | null> {
    const result = await pool.query('SELECT * FROM ATIVO WHERE id = $1', [id]);

    // Mapear o retorno do banco 
    if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
            id: row.id,
            patrimonio: row.patrimonio,
            id_tipo_ativo: row.tipo_ativo,
            id_status: row.status,
            id_localizacao: row.localizacao,
            id_responsavel: row.responsavel,
            obs: row.observacoes
        } as Ativo;
    }
    return null;
}

// Buscar todos os ativos
export async function findAll(): Promise<Ativo[]> {
    const result = await pool.query('SELECT * FROM ATIVO');
    return result.rows.map(row => ({
        id: row.id,
        patrimonio: row.patrimonio,
        id_tipo_ativo: row.tipo_ativo,
        id_status: row.status,
        id_localizacao: row.localizacao,
        id_responsavel: row.responsavel,
        obs: row.observacoes
    } as Ativo));
}

// Criar novo ativo
export async function create(ativo: Ativo): Promise<Ativo> {
    const query = `
        INSERT INTO ATIVO (patrimonio, tipo_ativo, status, localizacao, responsavel, observacoes) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const values = [ativo.patrimonio, ativo.id_tipo_ativo, ativo.id_status, ativo.id_localizacao, ativo.id_responsavel, ativo.obs];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Atualizar ativo existente
export async function update(id: number, ativo: Ativo): Promise<Ativo> {
    const query = `
        UPDATE ATIVO SET 
            tipo_ativo = $1, status = $2, localizacao = $3, responsavel = $4, patrimonio = $5, observacoes = $6
        WHERE id = $7 RETURNING *
    `;
    const values = [ativo.id_tipo_ativo, ativo.id_status, ativo.id_localizacao, ativo.id_responsavel, ativo.patrimonio, ativo.obs, id];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Inserir histórico
export async function createHistorico(hist: HistoricoAtivo): Promise<void> {
    const query = `
        INSERT INTO historico_ativo (
            ativo_id, data_movimentacao, usuario_alteracao, 
            status_anterior, status_novo,
            localizacao_anterior, localizacao_novo,
            responsavel_anterior, responsavel_novo, observacao
        ) VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    await pool.query(query, [
        hist.ativo_id, hist.usuario_alteracao,
        hist.status_anterior, hist.status_novo,
        hist.localizacao_anterior, hist.localizacao_novo,
        hist.responsavel_anterior, hist.responsavel_novo,
        hist.observacao
    ]);
}

// FUNÇÃO DO DASHBOARD 

export async function getDashboardStats() {
    
    const query = `
        SELECT 
            -- Conta todas as linhas da tabela (Total de Ativos)
            COUNT(*)::int as total,
            
            -- Soma apenas se status for 15 (Em estoque)
            COALESCE(SUM(CASE WHEN status = 15 THEN 1 ELSE 0 END), 0)::int as estoque,
            
            -- Soma apenas se status for 14 (Em manutenção)
            COALESCE(SUM(CASE WHEN status = 14 THEN 1 ELSE 0 END), 0)::int as manutencao,
            
            -- Soma apenas se status for 16 (Descartado)
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

export async function getUltimasMovimentacoes() {
    const query = `
        SELECT 
            a.patrimonio as ativo,      
            h.usuario_alteracao as usuario,
            s.descricao as acao,       
            h.data_movimentacao as data
        FROM historico_ativo h
        INNER JOIN ATIVO a ON h.ativo_id = a.ativo_id
        INNER JOIN STATUS_ATIVO s ON h.status_novo = s.status_id
        ORDER BY h.data_movimentacao DESC
        LIMIT 5
    `;

    const result = await pool.query(query);
    return result.rows;
}