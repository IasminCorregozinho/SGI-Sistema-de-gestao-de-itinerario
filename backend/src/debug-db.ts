
import { pool } from './config/db';

async function debug() {
    try {
        console.log('--- DEBUGGING TIPO_ATIVO ---');
        const resTipo = await pool.query('SELECT * FROM TIPO_ATIVO LIMIT 1');
        console.log(resTipo.rows[0]);

        try {
            console.log('--- INSPECTING LOCALIZACAO_ATIVO ---');
            const res = await pool.query('SELECT * FROM localizacao_ativo LIMIT 1');
            console.log('COLUMNS:', res.rows[0]);
        } catch (e) {
            console.log('INSPECT FAILED:', e);
        }

        try {
            console.log('--- TESTING MAIN QUERY ---');
            const query = `
                SELECT 
                    a.*, 
                    s.descricao as status_nome,
                    t.descricao as tipo_ativo_nome,
                    l.descricao as localizacao_nome,
                    r.nome as responsavel_nome
                FROM ATIVO a
                LEFT JOIN STATUS_ATIVO s ON a.status = s.status_id
                LEFT JOIN TIPO_ATIVO t ON a.tipo_ativo = t.tipo_ativo_id
                LEFT JOIN localizacao_ativo l ON a.localizacao = l.localizacao_id
                LEFT JOIN RESPONSAVEL r ON a.responsavel = r.responsavel_id
                LIMIT 1
            `;
            const res = await pool.query(query);
            console.log('QUERY SUCCESS:', res.rows[0]);
        } catch (e) {
            console.log('QUERY FAILED:', e);
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        // Force exit to ensure script finishes
        process.exit(0);
    }
}

debug();
