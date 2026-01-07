
// modal-ativo.js
const ModalAtivo = {
    editingId: null, // Armazena o ID do ativo sendo editado

    // Injeta o HTML do modal no corpo da página
    injectModal: function () {
        if (document.getElementById('modalCadastro')) return; // Evita duplicação

        const modalHTML = `
        <div id="modalCadastro" class="modal-overlay">
            <div class="modal-box">
                <span class="close-btn" id="fecharModalCadastro">&times;</span>
                <h2 id="modalTitle">Cadastrar Novo Ativo</h2>

                <div id="msgCadastro"
                    style="display: none; padding: 10px; margin-bottom: 10px; border-radius: 5px; text-align: center; font-weight: 500;">
                </div>

                <form id="formAtivo">
                    <div class="form-group">
                        <label>Nº Patrimônio</label>
                        <input type="text" id="patrimonio" placeholder="Ex: COMP-001" required>
                    </div>

                    <div class="form-group">
                        <label>Tipo de Ativo</label>
                        <select id="tipo_ativo">
                            <option value="">Carregando...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Marca / Modelo</label>
                        <input type="text" id="marca_modelo" placeholder="Ex: Dell Inspiron">
                    </div>

                    <div class="form-group">
                        <label>Status</label>
                        <select id="status">
                            <option value="">Carregando...</option>
                        </select>
                    </div>

                    <div class="form-group" id="grpValorManutencao" style="display: none;">
                        <label>Valor da Manutenção (R$)</label>
                        <input type="number" id="valor_manutencao" step="0.01" min="0" placeholder="0,00">
                    </div>

                    <div class="form-group">
                        <label>Localização</label>
                        <select id="localizacao">
                            <option value="">Carregando...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Responsável</label>
                        <select id="responsavel">
                            <option value="">Carregando...</option>
                        </select>
                    </div>

                    <div class="form-group span-2">
                        <label>Observações</label>
                        <textarea id="observacoes" rows="3"></textarea>
                    </div>

                    <button type="submit" class="btn-salvar">Salvar Ativo</button>
                </form>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // Inicializa os eventos e carrega as opções
    init: function () {
        this.injectModal();
        this.setupEventListeners();
        this.carregarOpcoes();
    },

    setupEventListeners: function () {
        const modal = document.getElementById('modalCadastro');
        const closeBtn = document.getElementById('fecharModalCadastro');
        const form = document.getElementById('formAtivo');

        // Botões que abrem o modal
        const openBtns = document.querySelectorAll('#btnNovoAtivo, #menuCadastrarAtivo');

        openBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetForm(); // Garante formulário limpo ao abrir novo
                modal.style.display = 'flex';
            });
        });

        // Fechar modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                this.resetForm();
            });
        }

        // Fechar ao clicar fora
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                this.resetForm();
            }
        });

        // Submissão do formulário
        if (form) {
            form.addEventListener('submit', (e) => this.salvarAtivo(e));
        }

        // Monitorar mudança de status para exibir campo de manutenção
        const statusSelect = document.getElementById('status');
        if (statusSelect) {
            statusSelect.addEventListener('change', () => this.verificarStatusManutencao());
        }
    },

    verificarStatusManutencao: function () {
        if (!this.editingId) return; // Só aplica na edição

        // Pega o status original (armazenado quando abriu o modal)
        const statusOriginal = this.statusOriginal;
        const novoStatus = parseInt(document.getElementById('status').value);
        const divManutencao = document.getElementById('grpValorManutencao');

        // Lógica: Se estava em Manutenção (14) e mudou para Em Uso (15)
        // OBS: Estou assumindo IDs fixos baseados no código anterior (14 warning, 15 success)
        if (statusOriginal == 14 && novoStatus == 15) {
            divManutencao.style.display = 'block';
            document.getElementById('valor_manutencao').required = true;
        } else {
            divManutencao.style.display = 'none';
            document.getElementById('valor_manutencao').value = '';
            document.getElementById('valor_manutencao').required = false;
        }
    },

    resetForm: function () {
        this.editingId = null;
        document.getElementById('formAtivo').reset();
        document.getElementById('msgCadastro').style.display = 'none';
        const title = document.getElementById('modalTitle');
        if (title) title.innerText = "Cadastrar Novo Ativo";

        // Habilita campo patrimônio caso esteja desabilitado
        const patInput = document.getElementById('patrimonio');
        if (patInput) patInput.disabled = false;
    },

    // Função auxiliar para abrir o modal em modo de edição
    abrirParaEdicao: function (ativo) {
        if (!ativo) return;

        this.editingId = ativo.id;
        this.statusOriginal = ativo.id_status; // Guarda o status original

        // Preenche campos
        if (document.getElementById('patrimonio')) {
            document.getElementById('patrimonio').value = ativo.patrimonio;
            // Opcional: Desabilitar edição de patrimônio se for regra de negócio
            // document.getElementById('patrimonio').disabled = true; 
        }
        if (document.getElementById('tipo_ativo')) document.getElementById('tipo_ativo').value = ativo.id_tipo_ativo || "";
        if (document.getElementById('marca_modelo')) document.getElementById('marca_modelo').value = ativo.marca_modelo;
        if (document.getElementById('status')) document.getElementById('status').value = ativo.id_status || "";
        if (document.getElementById('localizacao')) document.getElementById('localizacao').value = ativo.id_localizacao || "";
        if (document.getElementById('responsavel')) document.getElementById('responsavel').value = ativo.id_responsavel || "";
        if (document.getElementById('observacoes')) document.getElementById('observacoes').value = ativo.obs;

        // Atualiza Título
        const title = document.getElementById('modalTitle');
        if (title) title.innerText = `Editar Ativo: ${ativo.patrimonio}`;

        // Abre modal
        const modal = document.getElementById('modalCadastro');
        if (modal) modal.style.display = 'flex';
    },

    carregarOpcoes: async function () {
        try {
            // Promise.all para carregar tudo em paralelo
            const [resTipos, resStatus, resLocais, resResp] = await Promise.all([
                fetch('/ativos/tipos'),
                fetch('/ativos/status'),
                fetch('/ativos/localizacoes'),
                fetch('/users/perfis')
            ]);

            if (resTipos.ok) this.popularSelect('tipo_ativo', await resTipos.json(), 'tipo_ativo_id', 'descricao');
            if (resStatus.ok) this.popularSelect('status', await resStatus.json(), 'status_id', 'descricao');
            if (resLocais.ok) this.popularSelect('localizacao', await resLocais.json(), 'localizacao_id', 'setor_sala');
            if (resResp.ok) this.popularSelect('responsavel', await resResp.json(), 'responsavel_id', 'nome');

        } catch (error) {
            console.error("Erro ao carregar opções do modal:", error);
        }
    },

    popularSelect: function (elementId, data, valueKey, textKey) {
        const select = document.getElementById(elementId);
        if (!select) return;

        select.innerHTML = ''; // Limpa opções "Carregando..."

        data.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item[valueKey];
            opt.textContent = item[textKey];
            select.appendChild(opt);
        });
    },

    mostrarMensagem: function (divId, texto, isErro) {
        const div = document.getElementById(divId);
        div.style.display = 'block';
        div.textContent = texto;
        div.style.backgroundColor = isErro ? '#f8d7da' : '#d1fae5';
        div.style.color = isErro ? '#721c24' : '#065f46';
        div.style.border = isErro ? '1px solid #f5c6cb' : '1px solid #a7f3d0';

        if (!isErro) {
            setTimeout(() => {
                div.style.display = 'none';
            }, 3000);
        }
    },

    salvarAtivo: async function (event) {
        event.preventDefault();

        const dadosAtivo = {
            patrimonio: document.getElementById('patrimonio').value,
            id_tipo_ativo: parseInt(document.getElementById('tipo_ativo').value),
            marca_modelo: document.getElementById('marca_modelo').value,
            id_status: parseInt(document.getElementById('status').value),
            id_localizacao: parseInt(document.getElementById('localizacao').value),
            id_responsavel: parseInt(document.getElementById('responsavel').value),
            obs: document.getElementById('observacoes').value,
            valor_manutencao: document.getElementById('valor_manutencao').value ? parseFloat(document.getElementById('valor_manutencao').value) : null
        };

        const isEdicao = !!this.editingId;
        const url = isEdicao ? `/ativos/${this.editingId}` : '/ativos';
        const method = isEdicao ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosAtivo)
            });

            if (response.ok) {
                const msgSucesso = isEdicao ? 'Ativo atualizado com sucesso!' : 'Ativo cadastrado com sucesso!';
                this.mostrarMensagem('msgCadastro', msgSucesso, false);
                setTimeout(() => {
                    document.getElementById('modalCadastro').style.display = 'none';
                    this.resetForm();

                    // Se estiver na tela de listagem, recarrega a lista
                    if (typeof carregarAtivos === 'function') {
                        carregarAtivos();
                        // Mostra mensagem global se existir
                        const msgGlobal = document.getElementById('divMensagemSistema');
                        if (msgGlobal) {
                            msgGlobal.textContent = msgSucesso;
                            msgGlobal.style.display = 'block';
                            msgGlobal.style.backgroundColor = '#d1fae5';
                            msgGlobal.style.color = '#065f46';
                            setTimeout(() => msgGlobal.style.display = 'none', 3000);
                        }
                    }
                }, 1500); // Espera 1.5s para o usuário ver a mensagem
            } else {
                const errorData = await response.json();
                this.mostrarMensagem('msgCadastro', errorData.error || 'Erro ao salvar ativo.', true);
            }
        } catch (error) {
            console.error('Erro:', error);
            this.mostrarMensagem('msgCadastro', 'Erro de conexão.', true);
        }
    }
};

// Auto-inicializar se o DOM já estiver pronto, ou esperar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ModalAtivo.init());
} else {
    ModalAtivo.init();
}
