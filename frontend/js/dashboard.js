document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");
  if (toggleBtn) {
    const toggleIcon = toggleBtn.querySelector("i");
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      if (sidebar.classList.contains("collapsed")) {
        toggleIcon.classList.remove("fa-chevron-left");
        toggleIcon.classList.add("fa-chevron-right");
      } else {
        toggleIcon.classList.remove("fa-chevron-right");
        toggleIcon.classList.add("fa-chevron-left");
      }
    });
  }

  // Inicialização
  const API_BASE = "/ativos";
  const API_USERS = "/users";
  let idParaExcluir = null;

  // Elementos DOM
  const modalCadastro = document.getElementById("modalCadastro");
  const modalGerenciar = document.getElementById("modalGerenciarPerfis");
  const modalConfirmacao = document.getElementById("modalConfirmacao");
  const formAtivo = document.getElementById("formAtivo");
  const formCriarPerfil = document.getElementById("formCriarPerfil");
  let idPerfilEmEdicao = null; // Variável para controlar se estamos editando
  let dadosOriginaisPerfil = {}; // Para comparar mudanças

  // --- Funções de Modal ---
  function abrirModalCadastro() {
    // Manipulado pelo modal-ativo.js
  }

  function fecharModalCadastroFunc() {
    // Manipulado pelo modal-ativo.js
  }

  // function abrirModalGerenciarPerfis: exibe o modal de gestão de usuários.
  // Reinicia o formulário e recarrega a lista de perfis.
  function abrirModalGerenciarPerfis() {
    if (modalGerenciar) {
      modalGerenciar.style.display = "flex";
      resetarFormularioPerfil(); // Garante estado limpo ao abrir
      listarPerfis();
    }
  }

  function fecharModalGerenciarPerfisFunc() {
    if (modalGerenciar) modalGerenciar.style.display = "none";
  }

  function fecharModalConfirmacao() {
    if (modalConfirmacao) modalConfirmacao.style.display = "none";
    idParaExcluir = null;
  }

  // Botões de Abertura Modal
  document
    .getElementById("menuGerenciarPerfis")
    ?.addEventListener("click", abrirModalGerenciarPerfis);
  document.getElementById("btnSair")?.addEventListener("click", logout);

  // Botões de Fechamento Modal
  document
    .getElementById("fecharModalGerenciarPerfis")
    ?.addEventListener("click", fecharModalGerenciarPerfisFunc);
  document
    .getElementById("btnCancelarConfirmacao")
    ?.addEventListener("click", fecharModalConfirmacao);
  document
    .getElementById("btnExecutarConfirmacao")
    ?.addEventListener("click", executarExclusao);

  // Fechar ao clicar fora
  window.onclick = function (event) {
    // if (event.target == modalGerenciar) fecharModalGerenciarPerfisFunc(); // Removido para evitar fechamento acidental
    if (event.target == modalConfirmacao) fecharModalConfirmacao();
  };

  // Fechar com ESC (Adicionado)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // Se confirmação estiver aberta, fecha ela primeiro
      if (modalConfirmacao && modalConfirmacao.style.display === "flex") {
        fecharModalConfirmacao();
        return;
      }
      // Se gerenciar perfil estiver aberto, fecha ele
      if (modalGerenciar && modalGerenciar.style.display === "flex") {
        fecharModalGerenciarPerfisFunc();
      }
    }
  });

  // Submissão de Formulários
  if (formCriarPerfil) {
    formCriarPerfil.addEventListener("submit", salvarPerfilFunc);
  }

  document
    .getElementById("btnCancelarEdicao")
    ?.addEventListener("click", resetarFormularioPerfil);

  // --- Lógica de Negócio ---
  // function verificarAcessoGerenciarPerfis: Verifica se o usuário logado tem permissão (Coordenação) na navBar
  // Se for perfil de Coordenação (ID 2), mostra o botão de gerenciar perfis.
  function verificarAcessoGerenciarPerfis() {
    const userStr = localStorage.getItem("usuario");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.perfil_id === 2) {
        document.getElementById("menuGerenciarPerfis").style.display = "block";
      } else {
        document.getElementById("menuGerenciarPerfis").style.display = "none";
      }

      // Exibir nome do usuário (Adicionado)
      const greetingEl = document.getElementById("userGreeting");
      if (greetingEl) {
        greetingEl.innerHTML = `<i class="fa-solid fa-circle-user" style="color: var(--ifg-green); font-size: 1.2rem;"></i> <span>Olá, <strong style="color: var(--text-primary);">${user.nome}</strong></span>`;
      }
    } else {
      // Se não tiver user, esconde
      document.getElementById("menuGerenciarPerfis").style.display = "none";
    }
  }

  // function carregarDashboard: Carrega todos os dados da tela (KPIs, Gráficos, Tabela).
  // Faz múltiplas chamadas à API para compor a visão geral.
  async function carregarDashboard() {
    try {
      // KPIs
      const respostaKpi = await fetch(`${API_BASE}/dashboard-kpis`);
      let dados = {};

      if (respostaKpi.ok) {
        dados = await respostaKpi.json();

        if (document.getElementById("kpi-total"))
          document.getElementById("kpi-total").innerText = dados.total || 0;
        if (document.getElementById("kpi-estoque"))
          document.getElementById("kpi-estoque").innerText = dados.estoque || 0;
        if (document.getElementById("kpi-manutencao"))
          document.getElementById("kpi-manutencao").innerText =
            dados.manutencao || 0;
        if (document.getElementById("kpi-descartado"))
          document.getElementById("kpi-descartado").innerText =
            dados.descartados || 0;

        // Gráfico de Status (Doughnut)
        if (
          typeof Chart !== "undefined" &&
          document.getElementById("meuGraficoStatus")
        ) {
          const ctxStatus = document
            .getElementById("meuGraficoStatus")
            .getContext("2d");
          if (window.graficoStatus) window.graficoStatus.destroy();

          window.graficoStatus = new Chart(ctxStatus, {
            type: "doughnut",
            data: {
              labels: ["Em Estoque", "Em Uso", "Manutenção", "Descartado"],
              datasets: [
                {
                  data: [
                    dados.estoque || 0,
                    dados.total -
                    (dados.estoque + dados.manutencao + dados.descartados) ||
                    0,
                    dados.manutencao || 0,
                    dados.descartados || 0,
                  ],
                  // Cores com degradê para o gráfico de Doughnut
                  backgroundColor: function (context) {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return null;

                    // Helper para criar gradiente vertical
                    const criarGradiente = (corInicio, corFim) => {
                      const gradient = ctx.createLinearGradient(
                        0,
                        chartArea.bottom,
                        0,
                        chartArea.top
                      );
                      gradient.addColorStop(0, corInicio);
                      gradient.addColorStop(1, corFim);
                      return gradient;
                    };

                    return [
                      criarGradiente("#10b981", "#6ee7b7"), // Estoque (Verde -> Verde Claro)
                      criarGradiente("#3b82f6", "#93c5fd"), // Em Uso (Azul -> Azul Claro)
                      criarGradiente("#f59e0b", "#fcd34d"), // Manutenção (Laranja -> Amarelo)
                      criarGradiente("#ef4444", "#fca5a5"), // Descartado (Vermelho -> Rosa Claro)
                    ];
                  },
                  borderWidth: 0, // Mais limpo sem bordas
                  hoverOffset: 15, // Efeito de destaque ao passar o mouse
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: "50%",
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                      family: "'Inter', sans-serif",
                      size: 12,
                    },
                  },
                },
                tooltip: {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  titleColor: "#1e293b",
                  bodyColor: "#1e293b",
                  borderColor: "#e2e8f0",
                  borderWidth: 1,
                  padding: 10,
                  displayColors: true,
                  boxPadding: 4,
                },
              },
              animation: {
                animateScale: true,
                animateRotate: true,
              },
            },
          });
        }

        // Grafico de Categorias (Barra)
        if (
          typeof Chart !== "undefined" &&
          document.getElementById("meuGraficoCategoria")
        ) {
          const ctxCat = document
            .getElementById("meuGraficoCategoria")
            .getContext("2d");
          if (window.graficoCategoria) window.graficoCategoria.destroy();

          // Preparar dados
          const cats = dados.categorias || [];
          const labelsCat = cats.map((c) => c.categoria);
          const valuesCat = cats.map((c) => c.quantidade);

          // Criar Gradiente para as barras (Verde IFG para um tom mais claro)
          const gradient = ctxCat.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "#32a041"); // IFG verde
          gradient.addColorStop(1, "#86efac"); // Light verde

          window.graficoCategoria = new Chart(ctxCat, {
            type: "bar",
            data: {
              labels: labelsCat,
              datasets: [
                {
                  label: "Quantidade",
                  data: valuesCat,
                  backgroundColor: gradient,
                  borderRadius: 6, // Cantos arredondados no topo
                  barPercentage: 0.55,
                  categoryPercentage: 0.6,
                  maxBarThickness: 50,
                  borderSkipped: false, // Arredondar todas as pontas (ou ajustar conforme lib)
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  titleColor: "#1e293b",
                  bodyColor: "#1e293b",
                  borderColor: "#e2e8f0",
                  borderWidth: 1,
                  padding: 10,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    font: {
                      family: "'Inter', sans-serif",
                    },
                  },
                  grid: {
                    color: "#f1f5f9", // Grid muito suave
                    borderDash: [5, 5],
                  },
                  border: {
                    display: false, // Remove a linha do eixo Y
                  },
                },
                x: {
                  grid: {
                    display: false, // Remove grid vertical
                  },
                  ticks: {
                    font: {
                      family: "'Inter', sans-serif",
                    },
                  },
                  border: {
                    display: false,
                  },
                },
              },
            },
          });
        }
      }

      // Tabela
      const respostaMov = await fetch(`${API_BASE}/movimentacoes-recentes`);
      if (respostaMov.ok) {
        const listaMovimentacoes = await respostaMov.json();
        const tbody = document.querySelector(".recent-activity tbody");
        if (tbody) {
          tbody.innerHTML = "";

          if (listaMovimentacoes.length === 0) {
            tbody.innerHTML =
              '<tr><td colspan="4" style="text-align:center;">Nenhuma movimentação recente.</td></tr>';
          } else {
            listaMovimentacoes.forEach((mov) => {
              const dataFormatada = new Date(mov.data).toLocaleDateString(
                "pt-BR"
              );

              // Determina cor baseado no nome do status (padronizado)
              const statusLower = (mov.status_nome || "").toLowerCase();
              let corBadge = "background-color: #e0f7fa; color: #006064;"; // Azul Padrão

              if (statusLower.includes("estoque")) {
                corBadge = "background-color: #d1fae5; color: #065f46;"; // Verde
              } else if (statusLower.includes("uso")) {
                corBadge = "background-color: #dbeafe; color: #1e40af;"; // Azul
              } else if (statusLower.includes("manute")) {
                corBadge = "background-color: #fff3cd; color: #856404;"; // Laranja
              } else if (
                statusLower.includes("descartado") ||
                statusLower.includes("baixa")
              ) {
                corBadge = "background-color: #fee2e2; color: #991b1b;"; // Vermelho
              }

              const linha = `
                                <tr>
                                    <td>${mov.ativo_nome || "---"}</td>
                                    <td>${mov.usuario || "Sistema"}</td>
                                    <td><span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; ${corBadge}">${mov.status_nome || "---"
                }</span></td>
                                    <td>${dataFormatada}</td>
                                </tr>`;
              tbody.innerHTML += linha;
            });
          }
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar dashboard:", error);
    }
  }

  // function salvarAtivo: Captura os dados do formulário de novo ativo e envia para a API.
  // Trata sucesso (mensagem global) e erros (mensagem no modal).
  async function salvarAtivo(event) {
    event.preventDefault();

    const dadosAtivo = {
      patrimonio: document.getElementById("patrimonio").value,
      id_tipo_ativo: parseInt(document.getElementById("tipo_ativo").value),
      marca_modelo: document.getElementById("marca_modelo").value,
      id_status: parseInt(document.getElementById("status").value),
      id_localizacao: parseInt(document.getElementById("localizacao").value),
      id_responsavel: parseInt(document.getElementById("responsavel").value),
      obs: document.getElementById("observacoes").value,
    };

    // Limpa mensagem do modal antes de tentar
    const msgDiv = document.getElementById("msgCadastro");
    if (msgDiv) msgDiv.style.display = "none";
    try {
      const resposta = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosAtivo),
      });
      if (resposta.ok) {
        fecharModalCadastroFunc();
        document.getElementById("formAtivo").reset();
        carregarDashboard();

        // Mostra sucesso no dashboard
        mostrarMensagem(
          "divMensagemSistema",
          "Ativo cadastrado com sucesso!",
          false
        );
      } else {
        // Mostra erro no modal
        mostrarMensagem("msgCadastro", "Erro ao salvar.", true);
      }
    } catch (error) {
      console.error("Erro:", error);
      // Mostra erro no modal
      mostrarMensagem("msgCadastro", "Erro de conexão.", true);
    }
  }

  // function salvarPerfilFunc: Roteador para criar ou editar perfil.
  // Decide qual função chamar com base na existência de um ID de edição.
  async function salvarPerfilFunc(e) {
    e.preventDefault();
    if (idPerfilEmEdicao) {
      await editarPerfilFunc();
    } else {
      await criarPerfilFunc();
    }
  }

  // function criarPerfilFunc: Envia requisição POST para criar novo usuário.
  async function criarPerfilFunc() {
    const nome = document.getElementById("conf_nome").value;
    const matricula = document.getElementById("conf_matricula").value;
    const senha = document.getElementById("conf_senha").value;
    const perfil_id = document.getElementById("conf_perfil_id").value;

    const msgDiv = document.getElementById("msgConfig");
    msgDiv.style.display = "none";

    // Validação de Campos Obrigatórios
    if (!nome.trim() || !matricula.trim() || !senha.trim() || !perfil_id) {
      mostrarMsgErroPerfil("Todos os campos são obrigatórios.");
      return;
    }
    try {
      const resposta = await fetch(`${API_USERS}/perfis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, matricula, senha, perfil_id }),
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        document.getElementById("modalGerenciarPerfis").style.display = "none";
        resetarFormularioPerfil();
        listarPerfis();
        window.mostrarMensagem(
          "divMensagemSistema",
          "Usuário criado com sucesso!",
          false);
      } else {
        throw new Error(dados.error || "Falha ao criar");
      }
    } catch (error) {
      mostrarMsgErroPerfil(error.message || "Erro de conexão");
    }
  }

  // function editarPerfilFunc: Envia requisição PATCH para atualizar usuário existente.
  // Envia apenas os dados que foram alterados.
  async function editarPerfilFunc() {
    const nome = document.getElementById("conf_nome").value;
    const matricula = document.getElementById("conf_matricula").value;
    const senha = document.getElementById("conf_senha").value;
    const perfil_id = document.getElementById("conf_perfil_id").value;

    // Identificar campos alterados
    const dadosAtualizacao = {};
    if (nome !== dadosOriginaisPerfil.nome) dadosAtualizacao.nome = nome;
    if (matricula !== dadosOriginaisPerfil.matricula)
      dadosAtualizacao.matricula = matricula;
    if (senha !== dadosOriginaisPerfil.senha) dadosAtualizacao.senha = senha;
    // O backend espera perfil_id como number, mas o value vem string.
    if (parseInt(perfil_id) !== parseInt(dadosOriginaisPerfil.perfil_id))
      dadosAtualizacao.perfil_id = parseInt(perfil_id);
    if (Object.keys(dadosAtualizacao).length === 0) {
      mostrarMsgErroPerfil("Nenhuma alteração detectada.");
      return;
    }
    try {
      const resposta = await fetch(`${API_USERS}/perfis/${idPerfilEmEdicao}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAtualizacao),
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        document.getElementById("modalGerenciarPerfis").style.display = "none";
        resetarFormularioPerfil();
        listarPerfis();
        window.mostrarMensagem(
          "divMensagemSistema",
          "Perfil atualizado com sucesso!",
          false);
      } else {
        throw new Error(dados.error || "Falha ao atualizar");
      }
    } catch (error) {
      mostrarMsgErroPerfil(error.message || "Erro de conexão");
    }
  }

  // function resetarFormularioPerfil: Limpa os campos e reseta o estado do modal para "Novo Cadastro".
  function resetarFormularioPerfil() {
    document.getElementById("formCriarPerfil").reset();
    idPerfilEmEdicao = null;
    dadosOriginaisPerfil = {};

    document.getElementById("btnSalvarPerfil").innerText = "Cadastrar Usuário";
    document.getElementById("btnCancelarEdicao").style.display = "none";
    document.querySelector("#modalGerenciarPerfis h3").innerText =
      "Cadastro de Novo Usuário";
  }

  // function cancelarEdicao: Cancela a edição e reseta o formulário
  function cancelarEdicao() {
    resetarFormularioPerfil();
  }

  // function preencherFormularioEdicao: Preenche o modal com dados de um usuário existente para edição.
  function preencherFormularioEdicao(perfil) {
    idPerfilEmEdicao = perfil.responsavel_id;
    dadosOriginaisPerfil = { ...perfil };
    document.getElementById("conf_nome").value = perfil.nome;
    document.getElementById("conf_matricula").value = perfil.matricula;
    document.getElementById("conf_senha").value = perfil.senha;
    document.getElementById("conf_perfil_id").value = perfil.perfil_id;
    document.getElementById("btnSalvarPerfil").innerText = "Salvar Alterações";
    document.getElementById("btnCancelarEdicao").style.display = "flex";
    document.querySelector("#modalGerenciarPerfis h3").innerText =
      "Editar Usuário";
  }

  // function listarPerfis: Busca e exibe a lista de usuários cadastrados no modal.
  async function listarPerfis() {
    const tbody = document.querySelector("#tabelaPerfis tbody");
    tbody.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';

    try {
      const resposta = await fetch(`${API_USERS}/perfis`);
      const perfis = await resposta.json();

      tbody.innerHTML = "";

      if (perfis.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="4">Nenhum perfil cadastrado.</td></tr>';
        return;
      }

      perfis.forEach((p) => {
        const tr = document.createElement("tr");
        const nomePerfil = p.perfil_id === 2 ? "Coordenação" : "Suporte";
        tr.innerHTML = `
                      <td>${p.nome}</td>
                      <td>${p.matricula}</td>
                      <td>${nomePerfil}</td>
                      <td style="white-space: nowrap;">
                          <button class="btn-edit-blue" style="padding: 6px 12px; font-size: 12px; margin-right: 10px; display: inline-flex; align-items: center; gap: 6px; background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 4px; cursor: pointer; transition: all 0.2s;" onclick='window.preencherFormularioEdicao(${JSON.stringify(
          p
        )})'>
                              <i class="fa-solid fa-pen"></i> EDITAR
                          </button>
                          <button class="btn-delete" style="padding: 6px 12px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;" onclick="confirmarExclusao(${p.responsavel_id
          })">
                              <i class="fa-solid fa-trash"></i> EXCLUIR
                          </button>
                      </td>`;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error("Erro ao listar perfis:", error);
      tbody.innerHTML =
        '<tr><td colspan="4" style="color:red">Erro ao carregar perfis.</td></tr>';
    }
  }

  // Expõe funções para o escopo global (para onclicks funcionarem)
  window.cancelarEdicao = cancelarEdicao;
  window.preencherFormularioEdicao = preencherFormularioEdicao;

  // Auxiliares de escopo global (poderiam ser refatorados)
  window.confirmarExclusao = function (id) {
    if (modalConfirmacao) {
      idParaExcluir = id;
      modalConfirmacao.style.display = "flex";
    }
  };

  async function executarExclusao() {
    if (!idParaExcluir) return;

    try {
      const resposta = await fetch(`${API_USERS}/perfis/${idParaExcluir}`, {
        method: "DELETE",
      });

      if (resposta.ok) {
        // Remove o modal de confirmação visualmente
        const modalConfirmacao = document.getElementById("modalConfirmacao");
        if (modalConfirmacao) modalConfirmacao.style.display = "none";

        document.getElementById("modalGerenciarPerfis").style.display = "none";
        listarPerfis();
        window.mostrarMensagem(
          "divMensagemSistema",
          "Perfil removido com sucesso!",
          false
        );
      } else {
        const erro = await resposta.json();
        mostrarMsgErroPerfil(
          erro.error || "Erro ao excluir perfil (Lógica pendente)."
        );
      }
    } catch (error) {
      mostrarMsgErroPerfil("Erro de conexão.");
    } finally {
      fecharModalConfirmacao();
    }
  }

  // Helpers de Mensagem (Perfil)
  function mostrarMsgSucessoPerfil(texto) {
    const div = document.getElementById("msgConfig");
    if (div) {
      div.innerText = texto;
      div.style.display = "block";
      div.style.backgroundColor = "#d1fae5";
      div.style.color = "#065f46";
      setTimeout(() => (div.style.display = "none"), 3000);
    }
  }

  function mostrarMsgErroPerfil(texto) {
    const div = document.getElementById("msgConfig");
    if (div) {
      div.innerText = texto;
      div.style.display = "block";
      div.style.backgroundColor = "#fee2e2";
      div.style.color = "#991b1b";
      setTimeout(() => (div.style.display = "none"), 3000);
    }
  }

  // Helper de Mensagem (Ativo/Global)
  window.mostrarMensagem = function (idElemento, texto, isErro = false) {
    const div = document.getElementById(idElemento);
    if (div) {
      div.innerText = texto;
      div.style.display = "block";
      if (isErro) {
        div.style.backgroundColor = "#fee2e2";
        div.style.color = "#991b1b";
      } else {
        div.style.backgroundColor = "#d1fae5";
        div.style.color = "#065f46";
      }
      setTimeout(() => (div.style.display = "none"), 3000);
    }
  };

  function logout(e) {
    if (e) e.preventDefault();
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
  }
  // function verificarLogin: Verifica se há usuário logado, senão redireciona
  function verificarLogin() {
    const userStr = localStorage.getItem("usuario");
    if (!userStr) {
      window.location.href = "index.html";
    }
  }

  // Iniciar
  verificarLogin();
  verificarAcessoGerenciarPerfis();
  carregarDashboard();
});
