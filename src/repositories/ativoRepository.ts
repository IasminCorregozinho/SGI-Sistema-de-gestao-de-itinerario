// Apenas comandos SQL 

import { pool } from '../config/db';
import { Ativo, HistoricoAtivo } from '../models/ativo';

// Buscar um ativo pelo ID
export async function findById(id: number): Promise<Ativo | null> {
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
            obs: row.observacoes
        } as Ativo;
    }
    return null;
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
            tipo_ativo = $1, status = $2, localizacao = $3, responsavel = $4, observacoes = $5
        WHERE ativo_id = $6 RETURNING *
    `;
    const values = [ativo.id_tipo_ativo, ativo.id_status, ativo.id_localizacao, ativo.id_responsavel, ativo.obs, id];
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