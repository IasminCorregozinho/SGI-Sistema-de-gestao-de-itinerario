import * as ativoRepo from '../repositories/ativoRepository';
import { Ativo } from '../models/ativo';

export async function cadastrarAtivo(dados: Ativo) {
    // verificar se o patrimônio já existe
    const novoAtivo = await ativoRepo.create(dados);
    return novoAtivo;
}

export async function listarAtivos() {
    return await ativoRepo.findAll();
}

export async function atualizarAtivo(id: number, dadosNovos: Ativo) {
    // Status atual do ativo no banco
    const ativoAntigo = await ativoRepo.findById(id);

    if (!ativoAntigo) {
        throw new Error('Ativo não encontrado');
    }

    // comparação de status, localização e responsável
    const mudouStatus = ativoAntigo.id_status !== dadosNovos.id_status;
    const mudouLocal = ativoAntigo.id_localizacao !== dadosNovos.id_localizacao;
    const mudouResponsavel = ativoAntigo.id_responsavel !== dadosNovos.id_responsavel;

    // se houve mudança crítica, registra no histórico
    if (mudouStatus || mudouLocal || mudouResponsavel) {
        await ativoRepo.createHistorico({
            ativo_id: id,
            usuario_alteracao: 1,
            status_anterior: ativoAntigo.id_status,
            status_novo: dadosNovos.id_status,
            localizacao_anterior: ativoAntigo.id_localizacao,
            localizacao_novo: dadosNovos.id_localizacao,
            responsavel_anterior: ativoAntigo.id_responsavel,
            responsavel_novo: dadosNovos.id_responsavel,
            observacao: dadosNovos.obs || 'Alteração cadastral'
        });
    }

    // atualizar o cadastro principal
    const ativoAtualizado = await ativoRepo.update(id, dadosNovos);
    return ativoAtualizado;
}

import * as AtivoRepository from '../repositories/ativoRepository';

export async function getDashboardData() {
    const stats = await AtivoRepository.getDashboardStats();

    return {
        total: stats?.total || 0,
        estoque: stats?.estoque || 0,
        manutencao: stats?.manutencao || 0,
        descartados: stats?.descartados || 0
    };
}

export async function getMovimentacoesRecentes() {
    return await AtivoRepository.getUltimasMovimentacoes();
}