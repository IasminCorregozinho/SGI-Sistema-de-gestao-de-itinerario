// User Controller
// * Este arquivo gerencia as requisições HTTP relacionadas aos Usuários e Perfis.
// * Ele atua como ponte entre o Frontend e o Serviço de Usuários.

import { Request, Response } from "express";
import * as userService from "../services/userService";

// function cadastrar: registra um novo usuário no sistema.
// Recebe nome, matrícula e senha, chama o serviço e retorna o usuário criado.
export async function cadastrar(req: Request, res: Response) {
  try {
    const user = await userService.registrarUsuario(req.body);
    return res
      .status(201)
      .json({ message: "Usuário criado com sucesso", user });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

// function autenticar: realiza o login do usuário.
// Verifica matrícula e senha, retornando sucesso ou erro de autenticação.
export async function autenticar(req: Request, res: Response) {
  try {
    const { matricula, senha } = req.body;
    const user = await userService.realizarLogin(matricula, senha);
    return res
      .status(200)
      .json({ message: "Login realizado com sucesso", user });
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
}

// function criarPerfil: cria um novo perfil de usuário (Coordenação ou Suporte).
// RF002: Apenas usuários autorizados podem criar novos perfis.
export async function criarPerfil(req: Request, res: Response) {
  try {
    const { nome, matricula, senha, perfil_id } = req.body;
    if (!matricula || !nome || !senha) {
      return res
        .status(400)
        .json({
          error:
            "Matrícula, nome e senha são obrigatórios para criar um perfil",
        });
    }
    const profile = await userService.criarPerfil(
      nome,
      matricula,
      senha,
      perfil_id
    );
    return res
      .status(201)
      .json({ message: "Perfil criado com sucesso", profile });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// function atualizarPerfil: atualiza os dados de um perfil existente.
// Permite alterar nome, matrícula, senha e tipo de perfil.
export async function atualizarPerfil(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const dados = req.body;

    // Filtra apenas campos permitidos
    const dadosAtualizacao: any = {};
    if (dados.nome) dadosAtualizacao.nome = dados.nome;
    if (dados.matricula) dadosAtualizacao.matricula = dados.matricula;
    if (dados.senha) dadosAtualizacao.senha = dados.senha;
    if (dados.perfil_id) dadosAtualizacao.perfil_id = dados.perfil_id;

    const updatedProfile = await userService.atualizarPerfil(
      id,
      dadosAtualizacao
    );
    return res
      .status(200)
      .json({
        message: "Perfil atualizado com sucesso",
        profile: updatedProfile,
      });
  } catch (error: any) {
    if (error.message === "Perfil não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: error.message });
  }
}

// function removerPerfil: remove um perfil de usuário do sistema.
// Exclui o registro do banco de dados pelo ID fornecido.
export async function removerPerfil(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    await userService.excluirPerfil(id);
    return res.status(200).json({ message: "Perfil excluído com sucesso" });
  } catch (error: any) {
    if (error.message === "Perfil não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

// function listarPerfis: lista todos os perfis cadastrados.
// Retorna um array com todos os usuários do sistema.
export async function listarPerfis(req: Request, res: Response) {
  try {
    const profiles = await userService.listarPerfis();
    return res.status(200).json(profiles);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
