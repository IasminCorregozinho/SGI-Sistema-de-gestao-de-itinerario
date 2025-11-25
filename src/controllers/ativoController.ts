import { Request, Response } from 'express';
import * as ativoService from '../services/ativoService';

export async function criar(req: Request, res: Response) {
    try {
        const resultado = await ativoService.cadastrarAtivo(req.body);
        return res.status(201).json(resultado);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}

export async function editar(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const resultado = await ativoService.atualizarAtivo(id, req.body);
        return res.status(200).json(resultado);
    } catch (error: any) {
        if (error.message === 'Ativo não encontrado') {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
}