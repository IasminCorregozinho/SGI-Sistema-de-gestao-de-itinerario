// * * Este arquivo é responsável por gerenciar as requisições HTTP relacionadas aos Ativos de TI.
// * Ele atua como uma ponte entre o Frontend (Cliente) e a Camada de Serviço (Regra de Negócio).

import { Request, Response } from "express";
import * as ativoService from "../services/ativoService";

// function criar: cria um novo ativo no sistema, recebe os dados do corpo da requisição (JSON),
// chama o serviço de cadastro e retorna o ativo criado com status 201 (Created).
export async function criar(req: Request, res: Response) {
  try {
    const usuarioId = parseInt(req.headers["x-user-id"] as string) || 1;
    // Envia os dados crus do formulário (req.body) para a regra de negócio.
    const resultado = await ativoService.cadastrarAtivo(req.body, usuarioId);
    // Retorna sucesso e o objeto criado
    return res.status(201).json(resultado);
  } catch (error: any) {
    // Retorna erro 500 em caso de falha no servidor ou validação
    console.error("Erro ao criar ativo:", error);
    return res.status(500).json({ error: error.message });
  }
}
// function editar: atualiza os dados de um ativo existente
// Busca o ativo pelo ID passado na URL e atualiza com os dados do corpo da requisição.
export async function editar(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const usuarioId = parseInt(req.headers["x-user-id"] as string) || 1;
    // Chama o serviço para atualizar o registro no banco
    const resultado = await ativoService.atualizarAtivo(
      id,
      req.body,
      usuarioId
    );
    return res.status(200).json(resultado);
  } catch (error: any) {
    console.error("Erro ao editar ativo:", error);
    // Tratamento específico: Se o ativo não existir, retorna 404 (Not Found)
    if (error.message === "Ativo não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}
// function listar: lista todos os ativos cadastrados no sistema.
// Utilizado para popular a tabela principal de listagem.
export async function listar(req: Request, res: Response) {
  try {
    // Busca a lista completa via serviço
    const ativos = await ativoService.listarAtivos();
    // Retorna a lista (array JSON)
    return res.status(200).json(ativos);
  } catch (error: any) {
    console.error("Erro ao listar ativo:", error);
    return res.status(500).json({ error: error.message });
  }
}
// function obterDadosDashboard: obtém os dados consolidados para a visualização do dashboard (KPIs e Gráficos).
export async function obterDadosDashboard(req: Request, res: Response) {
  try {
    const dados = await ativoService.obterDadosDashboard();
    res.status(200).json(dados);
  } catch (error) {
    console.error("Erro no controller de dashboard:", error);
    res.status(500).json({ message: "Erro ao buscar dados do dashboard" });
  }
}
// function obterMovimentacoes: obtém as movimentações recentes dos ativos.
// Mostra as últimas ações realizadas no sistema (quem fez o que e quando).

export async function obterMovimentacoes(req: Request, res: Response) {
  try {
    const movimentacoes = await ativoService.obterMovimentacoesRecentes();
    res.status(200).json(movimentacoes);
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);
    res.status(500).json({ message: "Erro interno ao buscar histórico" });
  }
}
// function listarStatus:Lista todas as opções de Status disponíveis no banco.
// é usado para preencher os Selecione... (dropdowns) no formulário de cadastro, filtro e edição

export async function listarStatus(req: Request, res: Response) {
  try {
    const statuses = await ativoService.listarStatus();
    res.status(200).json(statuses);
  } catch (error) {
    console.error("Erro ao listar status:", error);
    res.status(500).json({ message: "Erro ao buscar status" });
  }
}

// function listarLocalizacoes: Lista todas as opções de Localizações disponíveis no banco.
// é usado para preencher os Selecione... (dropdowns) no formulário de cadastro, filtro e edição
export async function listarLocalizacoes(req: Request, res: Response) {
  try {
    const locais = await ativoService.listarLocalizacoes();
    res.status(200).json(locais);
  } catch (error) {
    console.error("Erro ao listar localizações:", error);
    res.status(500).json({ message: "Erro ao buscar localizações" });
  }
}

// function listarTiposAtivo: Lista todos os tipo de ativos cadastrados no banco.
// é usado para preencher os Selecione... (dropdowns) no formulário de cadastro, filtro e edição
export async function listarTiposAtivo(req: Request, res: Response) {
  try {
    const tipos = await ativoService.listarTiposAtivo();
    res.status(200).json(tipos);
  } catch (error) {
    console.error("Erro ao listar tipos de ativo:", error);
    res.status(500).json({ message: "Erro ao buscar tipos de ativo" });
  }
}

// function criarTipo: Cria um novo Tipo de Ativo
export async function criarTipo(req: Request, res: Response) {
  try {
    const { descricao } = req.body;
    const novo = await ativoService.criarTipoAtivo(descricao);
    res.status(201).json(novo);
  } catch (error: any) {
    console.error("Erro ao criar tipo:", error);
    res.status(500).json({ message: "Erro ao criar tipo de ativo" });
  }
}

// function criarLocalizacao: Cria uma nova Localização
export async function criarLocalizacao(req: Request, res: Response) {
  try {
    const { nome } = req.body;
    const novo = await ativoService.criarLocalizacao(nome);
    res.status(201).json(novo);
  } catch (error: any) {
    console.error("Erro ao criar localização:", error);
    res.status(500).json({ message: "Erro ao criar localização" });
  }
}

// function listarHistorico: Obtém o histórico específico de UM ativo.
// Recebe o ID do ativo na URL e retorna todas as alterações daquele item.
export async function listarHistorico(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const historico = await ativoService.obterHistorico(id);
    res.status(200).json(historico);
  } catch (error) {
    console.error("Erro ao listar histórico:", error);
    res.status(500).json({ message: "Erro ao buscar histórico" });
  }
}
