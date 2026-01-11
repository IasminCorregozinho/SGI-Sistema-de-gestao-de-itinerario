// * Define a estrutura de dados e as operações de banco de dados para Usuários.

import { pool } from "../config/db";

export interface User {
  id?: number;
  name: string;
  matricula: string;
  senha: string;
  perfil_id: number;
}

// function buscarUsuarioPorMatricula: recupera um usuário do banco pela matrícula.
// Retorna o objeto do usuário ou undefined se não encontrar.
export async function buscarUsuarioPorMatricula(matricula: string) {
  const result = await pool.query(
    "SELECT * FROM responsavel WHERE matricula = $1",
    [matricula]
  );
  return result.rows[0];
}

// function criarUsuario: insere um novo usuário na tabela 'responsavel'.
// Retorna o usuário recém-criado.
export async function criarUsuario(user: User) {
  const { name, matricula, senha, perfil_id } = user;
  const result = await pool.query(
    "INSERT INTO responsavel (nome, matricula, senha, perfil_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, matricula, senha, perfil_id]
  );
  return result.rows[0];
}
