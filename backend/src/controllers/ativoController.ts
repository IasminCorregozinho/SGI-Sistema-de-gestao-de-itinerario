import { Request, Response } from 'express';
import * as ativoService from '../services/ativoService';

export async function criar(req: Request, res: Response) {
    try {
        const resultado = await ativoService.cadastrarAtivo(req.body);
        return res.status(201).json(resultado);
    } catch (error: any) {
        console.error('Erro ao criar ativo:', error);
        return res.status(500).json({ error: error.message });
    }
}

export async function editar(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const resultado = await ativoService.atualizarAtivo(id, req.body);
        return res.status(200).json(resultado);
    } catch (error: any) {
        console.error('Erro ao editar ativo:', error);
        if (error.message === 'Ativo não encontrado') {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
}

export async function listar(req: Request, res: Response) {
    try {
        const ativos = await ativoService.listarAtivos();
        return res.status(200).json(ativos);
    } catch (error: any) {
        console.error('Erro ao listar ativo:', error);
        return res.status(500).json({ error: error.message });
    }
}

export async function obterDadosDashboard(req: Request, res: Response) {
    try {
        const dados = await ativoService.obterDadosDashboard();
        res.status(200).json(dados);
    } catch (error) {
        console.error('Erro no controller de dashboard:', error);
        res.status(500).json({ message: 'Erro ao buscar dados do dashboard' });
    }
}

export async function obterMovimentacoes(req: Request, res: Response) {
    try {
        const movimentacoes = await ativoService.obterMovimentacoesRecentes();
        res.status(200).json(movimentacoes);
    } catch (error) {
        console.error('Erro ao buscar movimentações:', error);
        res.status(500).json({ message: 'Erro interno ao buscar histórico' });
    }
}