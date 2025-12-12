import { pool } from "../config/db";

export interface User {
  id?: number;
  name: string;
  matricula: string;
  senha: string;
  perfil_id: number;
}


export async function findUserByMatricula(matricula: string) {
  const result = await pool.query("SELECT * FROM responsavel WHERE matricula = $1", [matricula]);
  return result.rows[0];
}


export async function createUser(user: User) {
  const { name, matricula, senha, perfil_id } = user;
  const result = await pool.query(
    "INSERT INTO responsavel (nome, matricula, senha, perfil_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, matricula, senha, perfil_id]
  );
  return result.rows[0];
}
