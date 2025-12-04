import { findUserByMatricula, createUser, User } from "../models/userModel";
import { pool } from "../config/db";

export async function registerUser(user: User) {
  const exists = await findUserByMatricula(user.matricula);
  if (exists) throw new Error("Matrícula já cadastrada");
  return await createUser(user);
}

export async function loginUser(matricula: string, senha: string) {
  const user = await findUserByMatricula(matricula);
  if (!user) throw new Error("Usuário não encontrado");
  if (user.senha !== senha) throw new Error("Senha incorreta! Por favor verifique a senha digitada.");
  return user;
}

// RF002: Inclusão de perfis
export async function createProfile(nome: string, matricula: string, senha: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Check if user exists
    const userCheck = await client.query("SELECT * FROM responsavel WHERE matricula = $1", [matricula]);
    let userId;

    if (userCheck.rows.length === 0) {
      // 2. Create user with NULL perfil_id
      const newUser = await client.query(
        "INSERT INTO responsavel (nome, matricula, senha, perfil_id) VALUES ($1, $2, $3, NULL) RETURNING responsavel_id",
        [nome, matricula, senha]
      );
      userId = newUser.rows[0].responsavel_id;
    } else {
      userId = userCheck.rows[0].responsavel_id;
    }

    // 3. Create profile
    const newProfile = await client.query(
      "INSERT INTO perfis (matricula) VALUES ($1) RETURNING *",
      [matricula]
    );
    const profileId = newProfile.rows[0].perfil_id;

    // 4. Update user with new perfil_id
    await client.query(
      "UPDATE responsavel SET perfil_id = $1 WHERE responsavel_id = $2",
      [profileId, userId]
    );

    await client.query('COMMIT');
    return newProfile.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// RF002: Exclusão de perfis
export async function deleteProfile(id: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Unlink users referencing this profile
    await client.query(
      "UPDATE responsavel SET perfil_id = NULL WHERE perfil_id = $1",
      [id]
    );

    // 2. Delete the profile
    const result = await client.query(
      "DELETE FROM perfis WHERE perfil_id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error("Perfil não encontrado");
    }

    await client.query('COMMIT');
    return result.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// Helper: Consulta de perfis
export async function getProfiles() {
  const result = await pool.query("SELECT * FROM perfis");
  return result.rows;
}