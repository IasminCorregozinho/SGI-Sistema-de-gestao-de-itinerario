/**
 * Camada de Serviço
 * Responsável por validar as regras de negócio, orquestrar chamadas ao banco de dados
 * e garantir a integridade dos dados (como registrar histórico automaticamente).
 */

import * as ativoRepo from '../repositories/ativoRepository';
import { Ativo } from '../models/ativo';

/**
 * Cadastra um novo ativo no sistema.
 * Verifica duplicidade de patrimônio e cria o registro inicial no histórico.
 * * @param dados - Objeto contendo as informações do ativo a ser criado.
 * @param usuarioId - ID do usuário que está realizando o cadastro.
 * @returns O objeto do ativo criado.
 */

export async function cadastrarAtivo(dados: Ativo, usuarioId: number = 1) {
    // verificar se o patrimônio já existe
    const existente = await ativoRepo.buscarPorPatrimonio(dados.patrimonio);
    if (existente) {
        throw new Error(`Patrimônio ${dados.patrimonio} já está cadastrado.`);
    }
    // Salva o novo ativo na tabela principal
    const novoAtivo = await ativoRepo.criar(dados);

    // Registro no histórico (CRIAÇÃO)
    if (novoAtivo && novoAtivo.id) {
        await ativoRepo.registrarHistorico({
            ativo_id: novoAtivo.id,
            usuario_alteracao: usuarioId,
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

// Lista todos os ativos da base de dados. @returns Array com todos os ativos.

export async function listarAtivos() {
    return await ativoRepo.buscarTodos();
}

/**
 * Atualiza os dados de um ativo existente.
 * Busca o estado anterior para comparação e registra as mudanças no histórico.
 * * @param id - ID do ativo a ser atualizado.
 * @param dadosNovos - Objeto parcial contendo apenas os campos que foram alterados.
 * @param usuarioId - ID do usuário realizando a edição 
 */

export async function atualizarAtivo(id: number, dadosNovos: Partial<Ativo>, usuarioId: number = 1) {
    // Status atual do ativo no banco
    const ativoAntigo = await ativoRepo.buscarPorId(id);

    if (!ativoAntigo) {
        throw new Error('Ativo não encontrado');
    }

    // Merge dos dados antigos com os novos (PATCH strategy)
    const ativoFinal = { ...ativoAntigo, ...dadosNovos };

    // Registra no histórico comparando o "Antigo" com o "Final"
    await ativoRepo.registrarHistorico({
        ativo_id: id,
        usuario_alteracao: usuarioId,
        status_anterior: ativoAntigo.id_status,
        status_novo: ativoFinal.id_status,
        localizacao_anterior: ativoAntigo.id_localizacao,
        localizacao_novo: ativoFinal.id_localizacao,
        responsavel_anterior: ativoAntigo.id_responsavel,
        responsavel_novo: ativoFinal.id_responsavel,
        observacao: dadosNovos.obs || 'Edição de cadastro',
        valor_manutencao: dadosNovos.valor_manutencao
    });

    // Atualiza o registro na tabela principal
    const ativoAtualizado = await ativoRepo.atualizar(id, ativoFinal as Ativo);
    return ativoAtualizado;
}

/**
 * Agrega os dados necessários para exibir no Dashboard.
 * Combina estatísticas gerais (totais) com agrupamentos por categoria.
 */
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

/**
 * Retorna as últimas movimentações registradas no sistema (Log de atividades).
 */
export async function obterMovimentacoesRecentes() {
    return await ativoRepo.obterMovimentacoesRecentes();
}
/**
 * Retorna a lista de status possíveis (ex: Em uso, Estoque, descartado).
 * Utilizado para popular 'selects' no frontend.
 */
export async function listarStatus() {
    return await ativoRepo.buscarStatus();
}

/**
 * Retorna a lista de localizações cadastradas.
 */
export async function listarLocalizacoes() {
    return await ativoRepo.buscarLocalizacoes();
}

/**
 * Retorna a lista de tipos de ativo (ex: Notebook, Monitor, Teclado).
 */

export async function listarTiposAtivo() {
    return await ativoRepo.buscarTiposAtivo();
}

/**
 * Busca o histórico completo de um único ativo.
 * @param id - ID do ativo.
 */
export async function obterHistorico(id: number) {
    return await ativoRepo.buscarHistoricoPorAtivoId(id);
}