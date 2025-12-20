import { buscarUsuarioPorMatricula, criarUsuario, User } from "../models/userModel";
import { pool } from "../config/db";

export async function registrarUsuario(user: User) {
  const exists = await buscarUsuarioPorMatricula(user.matricula);
  if (exists) throw new Error("Matrícula já cadastrada");
  return await criarUsuario(user);
}

export async function realizarLogin(matricula: string, senha: string) {
  const user = await buscarUsuarioPorMatricula(matricula);
  if (!user) throw new Error("Usuário não encontrado");
  if (user.senha !== senha) throw new Error("Senha incorreta! Por favor verifique a senha digitada.");
  return user;
}

// RF002: Inclusão de perfis (Criação de novos usuários com perfil definido)
export async function criarPerfil(nome: string, matricula: string, senha: string, perfil_id: number = 1) {
  // Por padrão, cria com perfil 1 (Suporte) se não especificado
  const client = await pool.connect();
  try {
    const existingUser = await client.query("SELECT * FROM responsavel WHERE matricula = $1", [matricula]);
    if (existingUser.rows.length > 0) {
      throw new Error("Matrícula já cadastrada para outro usuário.");
    }

    const result = await client.query(
      "INSERT INTO responsavel (nome, matricula, senha, perfil_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [nome, matricula, senha, perfil_id]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

// RF002: Exclusão de perfis (Exclusão de usuários)
export async function excluirPerfil(id: number) {
  const result = await pool.query(
    "DELETE FROM responsavel WHERE responsavel_id = $1 RETURNING *",
    [id]
  );

  if (result.rowCount === 0) {
    throw new Error("Usuário não encontrado");
  }
  return result.rows[0];
}

// Auxiliar: Consulta de perfis (Listagem de usuários cadastrados)
export async function listarPerfis() {
  const result = await pool.query("SELECT * FROM responsavel ORDER BY responsavel_id ASC");
  return result.rows;
}