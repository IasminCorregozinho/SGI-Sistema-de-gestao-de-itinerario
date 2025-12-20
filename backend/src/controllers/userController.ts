import { Request, Response } from "express";
import * as userService from "../services/userService";

export async function cadastrar(req: Request, res: Response) {
  try {
    const user = await userService.registrarUsuario(req.body);
    return res.status(201).json({ message: "Usuário criado com sucesso", user });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function autenticar(req: Request, res: Response) {
  try {
    const { matricula, senha } = req.body;
    const user = await userService.realizarLogin(matricula, senha);
    return res.status(200).json({ message: "Login realizado com sucesso", user });
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
}

export async function criarPerfil(req: Request, res: Response) {
  try {
    const { nome, matricula, senha, perfil_id } = req.body;
    if (!matricula || !nome || !senha) {
      return res.status(400).json({ error: "Matrícula, nome e senha são obrigatórios para criar um perfil" });
    }
    const profile = await userService.criarPerfil(nome, matricula, senha, perfil_id);
    return res.status(201).json({ message: "Perfil criado com sucesso", profile });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

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

export async function listarPerfis(req: Request, res: Response) {
  try {
    const profiles = await userService.listarPerfis();
    return res.status(200).json(profiles);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}