import * as ativoRepo from '../repositories/ativoRepository';
import { Ativo } from '../models/ativo';

export async function cadastrarAtivo(dados: Ativo) {
    // verificar se o patrimônio já existe
    const existente = await ativoRepo.buscarPorPatrimonio(dados.patrimonio);
    if (existente) {
        throw new Error(`Patrimônio ${dados.patrimonio} já está cadastrado.`);
    }

    const novoAtivo = await ativoRepo.criar(dados);

    // Registro no histórico (CRIAÇÃO)
    if (novoAtivo && novoAtivo.id) {
        await ativoRepo.registrarHistorico({
            ativo_id: novoAtivo.id,
            usuario_alteracao: 1, // TODO: Pegar do contexto de sessão
            status_anterior: null,
            status_novo: novoAtivo.id_status,
            localizacao_anterior: null,
            localizacao_novo: novoAtivo.id_localizacao,
            responsavel_anterior: null,
            responsavel_novo: novoAtivo.id_responsavel,
            observacao: 'Cadastro inicial',
            valor_manutencao: dados.valor_manutencao
        });
    }

    return novoAtivo;
}

export async function listarAtivos() {
    return await ativoRepo.buscarTodos();
}

export async function atualizarAtivo(id: number, dadosNovos: Ativo) {
    // Status atual do ativo no banco
    const ativoAntigo = await ativoRepo.buscarPorId(id);

    if (!ativoAntigo) {
        throw new Error('Ativo não encontrado');
    }

    // Registra no histórico qualquer alteração
    await ativoRepo.registrarHistorico({
        ativo_id: id,
        usuario_alteracao: 1, // TODO: Sessão
        status_anterior: ativoAntigo.id_status,
        status_novo: dadosNovos.id_status,
        localizacao_anterior: ativoAntigo.id_localizacao,
        localizacao_novo: dadosNovos.id_localizacao,
        responsavel_anterior: ativoAntigo.id_responsavel,
        responsavel_novo: dadosNovos.id_responsavel,
        observacao: dadosNovos.obs || 'Edição de cadastro',
        valor_manutencao: dadosNovos.valor_manutencao
    });

    // atualizar o cadastro principal
    const ativoAtualizado = await ativoRepo.atualizar(id, dadosNovos);
    return ativoAtualizado;
}



export async function obterDadosDashboard() {
    const stats = await ativoRepo.obterDadosDashboard();
    const categorias = await ativoRepo.obterContagemPorCategoria();

    return {
        total: stats?.total || 0,
        estoque: stats?.estoque || 0,
        manutencao: stats?.manutencao || 0,
        descartados: stats?.descartados || 0,
        categorias: categorias || []
    };
}

export async function obterMovimentacoesRecentes() {
    return await ativoRepo.obterMovimentacoesRecentes();
}

export async function listarStatus() {
    return await ativoRepo.buscarStatus();
}

export async function listarLocalizacoes() {
    return await ativoRepo.buscarLocalizacoes();
}

export async function listarTiposAtivo() {
    return await ativoRepo.buscarTiposAtivo();
}

export async function obterHistorico(id: number) {
    return await ativoRepo.buscarHistoricoPorAtivoId(id);
}