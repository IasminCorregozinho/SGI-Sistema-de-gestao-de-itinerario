import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Garante que o .env da raiz seja lido corretamente
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

console.log('[AGUARDE...] Tentando conectar ao banco:', {
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});

// Cria um "pool" de conexões (várias conexões prontas para uso)
export const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT || '5432'),
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Necessário para Supabase/AWS muitas vezes
});
