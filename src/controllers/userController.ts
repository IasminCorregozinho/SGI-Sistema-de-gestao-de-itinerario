import { Request, Response } from "express";
import * as userService from "../services/userService";

export async function register(req: Request, res: Response) {
  try {
    const user = await userService.registerUser(req.body);
    return res.status(201).json({ message: "Usuário criado", user });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { matricula, senha } = req.body;
    const user = await userService.loginUser(matricula, senha);
    return res.status(200).json({ message: "Sucesso! Login bem-sucedido", user });
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
}

export async function createProfile(req: Request, res: Response) {
  try {
    const { nome, matricula, senha } = req.body;
    if (!matricula || !nome || !senha) {
      return res.status(400).json({ error: "Matrícula, nome e senha são obrigatórios para criar um perfil" });
    }
    const profile = await userService.createProfile(nome, matricula, senha);
    return res.status(201).json({ message: "Perfil criado com sucesso", profile });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function removeProfile(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    await userService.deleteProfile(id);
    return res.status(200).json({ message: "Perfil excluído com sucesso" });
  } catch (error: any) {
    if (error.message === "Perfil não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

export async function listProfiles(req: Request, res: Response) {
  try {
    const profiles = await userService.getProfiles();
    return res.status(200).json(profiles);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}