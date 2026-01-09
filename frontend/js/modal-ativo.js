// modal-ativo.js
const ModalAtivo = {
  editingId: null, // Armazena o ID do ativo sendo editado

  // Injeta o HTML do modal no corpo da página
  // function injectModal: Cria dinamicamente o HTML do modal e o insere no DOM.
  // Inclui também os estilos (CSS) específicos do modal.
  injectModal: function () {
    if (document.getElementById("modalCadastro")) return; // Evita duplicação

    const modalHTML = `
        <div id="modalCadastro" class="modal-overlay">
            <div class="modal-box">
                <span class="close-btn" id="fecharModalCadastro">&times;</span>
                <h2 id="modalTitle">Cadastrar Novo Ativo</h2>

                <div id="msgCadastro"
                    style="display: none; padding: 8px 16px; margin: 10px auto; border-radius: 20px; text-align: center; font-weight: 500; width: fit-content; max-width: 90%; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                </div>

                <form id="formAtivo">
                    <div class="form-group">
                        <label>Nº Patrimônio</label>
                        <input type="text" id="patrimonio" placeholder="Ex: COMP-001" required>
                    </div>

                    <div class="form-group">
                        <label>Tipo de Ativo</label>
                        <select id="tipo_ativo" required>
                            <option value="">Carregando...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Marca / Modelo</label>
                        <input type="text" id="marca_modelo" placeholder="Ex: Dell Inspiron">
                    </div>

                    <div class="form-group">
                        <label>Número de Série</label>
                        <input type="text" id="numero_serie" placeholder="Ex: SN12345678">
                    </div>

                    <!-- Grupo de Armazenamento (Dinâmico para Desktop/Notebook) -->
                    <div id="grpArmazenamento" class="span-2 storage-group" style="display: none;">
                        
                        <div class="storage-container">
                            <!-- Tipo de Armazenamento -->
                            <div class="storage-type">
                                <label>Tipo de Armazenamento</label>
                                <div class="radio-group">
                                    <label>
                                        <input type="radio" name="tipo_armazenamento" value="HD"> HD
                                    </label>
                                    <label>
                                        <input type="radio" name="tipo_armazenamento" value="SSD"> SSD
                                    </label>
                                    <label>
                                        <input type="radio" name="tipo_armazenamento" value="Outro"> Outro
                                    </label>
                                </div>
                            </div>

                            <!-- Capacidade -->
                            <div id="divCapacidade" class="storage-capacity" style="display: none;">
                                <label>Capacidade</label>
                                <input type="text" id="capacidade_armazenamento" placeholder="Ex: 240GB">
                            </div>
                        </div>
                        <hr class="storage-divider">
                    </div>

                    <div class="form-group">
                        <label>Status</label>
                        <select id="status" required>
                            <option value="">Carregando...</option>
                        </select>
                    </div>

                    <div class="form-group" id="grpValorManutencao" style="display: none;">
                        <label>Valor da Manutenção (R$)</label>
                        <input type="text" id="valor_manutencao" placeholder="R$ 0,00">
                    </div>

                    <div class="form-group">
                        <label>Localização</label>
                        <select id="localizacao" required>
                            <option value="">Carregando...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Responsável</label>
                        <select id="responsavel" required>
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

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Estilos específicos do modal
    const style = document.createElement("style");
    style.innerHTML = `
            /* Ajuste para modal injetado */
            #modalCadastro .modal-box {
                border-top: none;
            }

            /* Faixa Degradê Superior (Padrão Dashboard/Login) */
            #modalCadastro .modal-box::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 6px;
                background: linear-gradient(90deg, var(--ifg-green), var(--ifg-red));
                z-index: 10;
            }

            /* Detalhe Vermelho Canto Superior Direito */
            #modalCadastro .modal-box::after {
                content: '';
                position: absolute;
                top: -60px;
                right: -60px;
                width: 150px;
                height: 150px;
                background-color: var(--ifg-red);
                border-radius: 50%;
                opacity: 0.1; /* Leve transparência para não brigar com o conteúdo */
                z-index: 0;
                pointer-events: none;
            }

            #modalCadastro h2 {
                text-align: center;
                color: var(--ifg-green);
                margin-top: 15px;
                margin-bottom: 30px;
                font-family: var(--font-heading);
                font-weight: 700;
                position: relative;
                z-index: 1; /* Ficar acima da bola vermelha */
            }

            /* Aumentar botão de fechar (Solicitação do usuário) */
            /* Ajuste do botão de fechar (Centralizado e Flex) */
            .close-btn {
                position: absolute;
                top: 15px;
                right: 20px;
                width: 32px;
                height: 32px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 24px;
                cursor: pointer;
                color: #64748b;
                transition: all 0.2s;
                border-radius: 50%;
                line-height: 1;
                z-index: 20;
            }
            .close-btn:hover {
                color: var(--ifg-red);
                background-color: rgba(234, 54, 54, 0.1);
            }
        `;
    document.head.appendChild(style);
  },

  // function init: Ponto de entrada do módulo.
  // Injeta o modal, configura eventos e carrega as opções dos selects.
  init: function () {
    this.injectModal();
    this.setupEventListeners();
    this.carregarOpcoes();
  },

  // function setupEventListeners: Configura os listeners de clique e submit.
  // Trata fechamento, abertura e máscara de moeda.
  setupEventListeners: function () {
    const modal = document.getElementById("modalCadastro");
    const closeBtn = document.getElementById("fecharModalCadastro");
    const form = document.getElementById("formAtivo");

    // Botões que abrem o modal
    const openBtns = document.querySelectorAll(
      "#btnNovoAtivo, #menuCadastrarAtivo"
    );

    openBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.resetForm(); // Garante formulário limpo ao abrir novo
        modal.style.display = "flex";
      });
    });

    // Fechar modal
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
        this.resetForm();
      });
    }
    // Submissão do formulário
    if (form) {
      form.addEventListener("submit", (e) => this.salvarAtivo(e));
    }
    // Monitorar mudança de status para exibir campo de manutenção
    const statusSelect = document.getElementById("status");
    if (statusSelect) {
      statusSelect.addEventListener("change", () =>
        this.verificarStatusManutencao()
      );
    }

    // Monitorar mudança de Tipo de Ativo
    const tipoSelect = document.getElementById("tipo_ativo");
    if (tipoSelect) {
      tipoSelect.addEventListener("change", () => this.verificarTipoAtivo());
    }

    // Monitorar Radio Buttons de Armazenamento
    const radiosArmazenamento = document.querySelectorAll(
      'input[name="tipo_armazenamento"]'
    );
    radiosArmazenamento.forEach((radio) => {
      radio.addEventListener("change", () => {
        const divCapacidade = document.getElementById("divCapacidade");
        // Se algum radio estiver marcado, mostra o campo de capacidade
        if (divCapacidade) divCapacidade.style.display = "block";
      });
    });

    // Formatação Automática "GB"
    const capInput = document.getElementById("capacidade_armazenamento");
    if (capInput) {
      capInput.addEventListener("blur", (e) => {
        const val = e.target.value.trim();
        if (val && !isNaN(val)) {
          // Se for apenas número
          e.target.value = val + " GB";
        }
      });
    }

    // Máscara de moeda
    const valorInput = document.getElementById("valor_manutencao");
    if (valorInput) {
      valorInput.addEventListener("input", (e) => {
        let value = e.target.value;
        value = value.replace(/\D/g, ""); // Remove tudo o que não é dígito
        value = (parseInt(value) / 100).toFixed(2) + ""; // Divide por 100 e fixa 2 casas
        value = value.replace(".", ","); // Troca ponto por vírgula
        value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."); // Adiciona pontos de milhar
        if (value === "NaN" || value === "undefined") {
          e.target.value = "";
          return;
        }
        e.target.value = "R$ " + value;
      });
    }
  },

  // function verificarStatusManutencao: Mostra/Esconde campo de valor baseado no status "Em Manutenção".
  verificarStatusManutencao: function () {
    const novoStatus = parseInt(document.getElementById("status").value);
    const divManutencao = document.getElementById("grpValorManutencao");

    // Lógica: Aparecer sempre que o status selecionado for "Em Manutenção" (14)
    if (novoStatus === 14) {
      divManutencao.style.display = "block";
      document.getElementById("valor_manutencao").required = true;
    } else {
      divManutencao.style.display = "none";
      document.getElementById("valor_manutencao").value = "";
      document.getElementById("valor_manutencao").required = false;
    }
  },

  // function verificarTipoAtivo: Mostra/Esconde campos de armazenamento para Desktop e Notebook
  verificarTipoAtivo: function () {
    const select = document.getElementById("tipo_ativo");
    const grpArmazenamento = document.getElementById("grpArmazenamento");
    if (!select || !grpArmazenamento) return;

    // Pega o TEXTO da opção selecionada (ex: "Notebook", "Desktop")
    const textoSelecionado = select.options[select.selectedIndex]?.text || "";
    const termo = textoSelecionado.toLowerCase();

    // Se for desktop ou notebook, exibe
    if (
      termo.includes("desktop") ||
      termo.includes("notebook") ||
      termo.includes("computador")
    ) {
      grpArmazenamento.style.display = "block";
    } else {
      grpArmazenamento.style.display = "none";
      // Limpa campos se esconder
      document
        .querySelectorAll('input[name="tipo_armazenamento"]')
        .forEach((r) => (r.checked = false));
      document.getElementById("capacidade_armazenamento").value = "";
      document.getElementById("divCapacidade").style.display = "none";
    }
  },

  // function resetForm: Limpa o formulário e reseta o estado para "Novo Cadastro".
  resetForm: function () {
    this.editingId = null;
    document.getElementById("formAtivo").reset();
    document.getElementById("msgCadastro").style.display = "none";
    const title = document.getElementById("modalTitle");
    if (title) title.innerText = "Cadastrar Novo Ativo";

    // Habilita campo patrimônio caso esteja desabilitado
    const patInput = document.getElementById("patrimonio");
    if (patInput) patInput.disabled = false;

    // Reseta área de armazenamento
    document.getElementById("grpArmazenamento").style.display = "none";
    document.getElementById("divCapacidade").style.display = "none";
    document
      .querySelectorAll('input[name="tipo_armazenamento"]')
      .forEach((r) => (r.checked = false));

    this.configurarCampoResponsavel();
  },

  // Configura o campo 'Responsável' com base no perfil do usuário logado
  // function configurarCampoResponsavel: Trava o campo de responsável se o usuário não for Coordenação.
  configurarCampoResponsavel: function () {
    const respSelect = document.getElementById("responsavel");
    if (!respSelect) return;

    const usuarioLogado = localStorage.getItem("usuario");
    if (usuarioLogado) {
      try {
        const u = JSON.parse(usuarioLogado);
        const perfilId = u.perfil_id;
        const meuResponsavelId = u.id || u.responsavel_id;

        // Perfil 2 = Coordenação/Administrador
        // Se NÃO for perfil 2, trava o select e seleciona o próprio usuário
        if (perfilId !== 2) {
          respSelect.value = meuResponsavelId;
          respSelect.disabled = true;

          // Adiciona um input hidden para garantir que o valor seja enviado no submit (se necessario)
          // Mas como estamos pegando via .value do elemento disabled, o JS pega normal.
        } else {
          respSelect.disabled = false;
        }
      } catch (e) {
        console.error("Erro ao configurar responsável", e);
      }
    }
  },

  // Função auxiliar para abrir o modal em modo de edição
  // function abrirParaEdicao: Prepara o modal para edição de um ativo existente.
  // Preenche os campos e armazena o estado original para diff.
  abrirParaEdicao: function (ativo) {
    if (!ativo) return;

    this.editingId = ativo.id;
    // Armazenar os dados originais para comparação (snapshot)
    this.dadosOriginais = {
      patrimonio: ativo.patrimonio,
      id_tipo_ativo: ativo.id_tipo_ativo,
      marca_modelo: ativo.marca_modelo,
      numero_serie: ativo.numero_serie, // Novo snapshot
      id_status: ativo.id_status,
      id_localizacao: ativo.id_localizacao,
      id_responsavel: ativo.id_responsavel,
      obs: ativo.obs,
      obs: ativo.obs,
      valor_manutencao: ativo.valor_manutencao
        ? parseFloat(ativo.valor_manutencao)
        : null,
      tipo_armazenamento: ativo.tipo_armazenamento,
      capacidade_armazenamento: ativo.capacidade_armazenamento,
    };

    // Preenche campos
    if (document.getElementById("patrimonio")) {
      document.getElementById("patrimonio").value = ativo.patrimonio;
    }
    if (document.getElementById("tipo_ativo"))
      document.getElementById("tipo_ativo").value = ativo.id_tipo_ativo || "";
    if (document.getElementById("marca_modelo"))
      document.getElementById("marca_modelo").value = ativo.marca_modelo;
    if (document.getElementById("numero_serie"))
      document.getElementById("numero_serie").value = ativo.numero_serie || ""; // Preencher
    if (document.getElementById("status"))
      document.getElementById("status").value = ativo.id_status || "";
    if (document.getElementById("localizacao"))
      document.getElementById("localizacao").value = ativo.id_localizacao || "";
    if (document.getElementById("responsavel"))
      document.getElementById("responsavel").value = ativo.id_responsavel || "";
    if (document.getElementById("observacoes"))
      document.getElementById("observacoes").value = ativo.obs;

    // Formatar valor da manutenção se existir
    if (document.getElementById("valor_manutencao") && ativo.valor_manutencao) {
      const valor = parseFloat(ativo.valor_manutencao)
        .toFixed(2)
        .replace(".", ",");
      document.getElementById("valor_manutencao").value = `R$ ${valor} `;
    } else {
      if (document.getElementById("valor_manutencao"))
        document.getElementById("valor_manutencao").value = "";
    }

    // Atualiza Título
    const title = document.getElementById("modalTitle");
    if (title) title.innerText = `Editar Ativo: ${ativo.patrimonio} `;

    // Abre modal
    const modal = document.getElementById("modalCadastro");
    if (modal) {
      modal.style.display = "flex";
      modal.style.display = "flex";
      this.verificarStatusManutencao(); // Garante que campos condicionais apareçam

      // Preencher campos de armazenamento se existirem e o tipo for compatível
      // Primeiro chama a verificação para exibir o container se for PC
      this.verificarTipoAtivo();

      if (ativo.tipo_armazenamento) {
        const radio = document.querySelector(
          `input[name = "tipo_armazenamento"][value = "${ativo.tipo_armazenamento}"]`
        );
        if (radio) {
          radio.checked = true;
          document.getElementById("divCapacidade").style.display = "block";
        }
      }
      if (ativo.capacidade_armazenamento) {
        document.getElementById("capacidade_armazenamento").value =
          ativo.capacidade_armazenamento;
      }

      this.configurarCampoResponsavel(); // Aplica regra de perfil
    }
  },

  // function carregarOpcoes: Busca dados auxiliares (Tipos, Status, Locais, Responsaveis) na API.
  carregarOpcoes: async function () {
    try {
      // Promise.all para carregar tudo em paralelo
      const [resTipos, resStatus, resLocais, resResp] = await Promise.all([
        fetch("/ativos/tipos"),
        fetch("/ativos/status"),
        fetch("/ativos/localizacoes"),
        fetch("/users/perfis"),
      ]);

      if (resTipos.ok) {
        const tipos = await resTipos.json();
        this.popularSelect("tipo_ativo", tipos, "tipo_ativo_id", "descricao");
      } else {
        console.error("Erro ao carregar tipos:", resTipos.status);
      }

      if (resStatus.ok) {
        const status = await resStatus.json();
        this.popularSelect("status", status, "status_id", "descricao");
      } else {
        console.error("Erro ao carregar status:", resStatus.status);
      }

      if (resLocais.ok) {
        const locais = await resLocais.json();
        this.popularSelect(
          "localizacao",
          locais,
          "localizacao_id",
          "setor_sala"
        );
      } else {
        console.error("Erro ao carregar locais:", resLocais.status);
      }

      if (resResp.ok) {
        const resps = await resResp.json();
        this.popularSelect("responsavel", resps, "responsavel_id", "nome");
      } else {
        console.error("Erro ao carregar responsáveis:", resResp.status);
      }
    } catch (error) {
      console.error("Erro CRÍTICO ao carregar opções do modal:", error);
      this.mostrarMensagem(
        "msgCadastro",
        "Erro ao carregar opções. Verifique o console.",
        true
      );
    }
  },

  // function popularSelect: Helper para criar as options de um elemento <select>.
  popularSelect: function (elementId, data, valueKey, textKey) {
    const select = document.getElementById(elementId);
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>Selecione</option>';

    data.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item[valueKey];
      opt.textContent = item[textKey];
      select.appendChild(opt);
    });

    // Se for o campo de responsável, re-aplica a regra de perfil pq o select foi recarregado
    if (elementId === "responsavel") {
      this.configurarCampoResponsavel();
    }
  },

  // function mostrarMensagem: Exibe feedback no topo do modal.
  mostrarMensagem: function (divId, texto, isErro) {
    const div = document.getElementById(divId);
    div.style.display = "block";
    div.textContent = texto;
    div.style.backgroundColor = isErro ? "#f8d7da" : "#d1fae5";
    div.style.color = isErro ? "#721c24" : "#065f46";
    div.style.border = isErro ? "1px solid #f5c6cb" : "1px solid #a7f3d0";

    if (!isErro) {
      setTimeout(() => {
        div.style.display = "none";
      }, 3000);
    }
  },

  // function salvarAtivo: Lógica central de persistência (POST/PATCH).
  // Verifica alterações (se edição) e trata resposta da API.
  salvarAtivo: async function (event) {
    event.preventDefault();

    const dadosFormulario = {
      patrimonio: document.getElementById("patrimonio").value,
      id_tipo_ativo: parseInt(document.getElementById("tipo_ativo").value),
      marca_modelo: document.getElementById("marca_modelo").value,
      numero_serie: document.getElementById("numero_serie").value, // Captura valor
      id_status: parseInt(document.getElementById("status").value),
      id_localizacao: parseInt(document.getElementById("localizacao").value),
      id_responsavel: parseInt(document.getElementById("responsavel").value),
      obs: document.getElementById("observacoes").value,
      obs: document.getElementById("observacoes").value,
      valor_manutencao: this.parseValorManutencao(
        document.getElementById("valor_manutencao").value
      ),
      tipo_armazenamento:
        document.querySelector('input[name="tipo_armazenamento"]:checked')
          ?.value || null,
      capacidade_armazenamento:
        document.getElementById("capacidade_armazenamento").value || null,
    };

    const isEdicao = !!this.editingId;
    let url = "/ativos";
    let method = "POST";
    let body = dadosFormulario;

    if (isEdicao) {
      url = `/ativos/${this.editingId}`;
      method = "PATCH";

      // Calcula apenas os campos alterados
      const dadosAlterados = {};
      let houveAlteracao = false;

      for (const key in dadosFormulario) {
        let valorOriginal = this.dadosOriginais[key];
        let valorNovo = dadosFormulario[key];

        // Normalização para comparação (null vs undefined vs vazio)
        // Trata strings vazias e null como iguais
        const normOriginal =
          valorOriginal === null || valorOriginal === undefined
            ? ""
            : String(valorOriginal).trim();
        const normNovo =
          valorNovo === null || valorNovo === undefined
            ? ""
            : String(valorNovo).trim();

        // Comparação estrita após normalização
        if (normNovo !== normOriginal) {
          dadosAlterados[key] = valorNovo;
          houveAlteracao = true;
        }
      }

      if (!houveAlteracao) {
        this.mostrarMensagem(
          "msgCadastro",
          "Nenhuma alteração realizada.",
          false
        );
        return;
      }
      body = dadosAlterados;
    }

    // Recupera o ID do usuário logado
    const usuarioLogado = localStorage.getItem("usuario");
    let usuarioId = 1;
    if (usuarioLogado) {
      try {
        const u = JSON.parse(usuarioLogado);
        usuarioId = u.id || u.responsavel_id || 1;
      } catch (e) {
        console.error("Erro ao ler usuário logado", e);
      }
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "x-user-id": usuarioId.toString(),
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const msgSucesso = isEdicao
          ? "Ativo atualizado com sucesso!"
          : "Ativo cadastrado com sucesso!";
        this.mostrarMensagem("msgCadastro", msgSucesso, false);
        setTimeout(() => {
          document.getElementById("modalCadastro").style.display = "none";
          this.resetForm();

          // Se estiver na tela de listagem, recarrega a lista
          if (typeof carregarAtivos === "function") {
            carregarAtivos();
            // Mostra mensagem global se existir
            const msgGlobal = document.getElementById("divMensagemSistema");
            if (msgGlobal) {
              msgGlobal.textContent = msgSucesso;
              msgGlobal.style.display = "block";
              msgGlobal.style.backgroundColor = "#d1fae5";
              msgGlobal.style.color = "#065f46";
              setTimeout(() => (msgGlobal.style.display = "none"), 3000);
            }
          }
        }, 1500); // Espera 1.5s para o usuário ver a mensagem
      } else {
        const errorData = await response.json();
        this.mostrarMensagem(
          "msgCadastro",
          errorData.error || "Erro ao salvar ativo.",
          true
        );
      }
    } catch (error) {
      console.error("Erro:", error);
      this.mostrarMensagem("msgCadastro", "Erro de conexão.", true);
    }
  },

  // function parseValorManutencao: Converte string para float
  parseValorManutencao: function (valorString) {
    if (!valorString) return null;
    // Remove "R$", pontos e espaços. Troca vírgula por ponto.
    const limpo = valorString.replace(/[R$\s.]/g, "").replace(",", ".");
    const numero = parseFloat(limpo);
    return isNaN(numero) ? null : numero;
  },
};

// Auto-inicializar se o DOM já estiver pronto, ou esperar
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => ModalAtivo.init());
} else {
  ModalAtivo.init();
}
