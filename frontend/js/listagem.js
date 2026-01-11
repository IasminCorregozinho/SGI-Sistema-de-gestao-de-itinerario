document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("sidebarToggle");
    const topScroll = document.getElementById("topScrollContainer");
    const mainTable = document.getElementById("mainTableContainer");

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

    // Sincronizar Scroll Superior com a Tabela
    if (topScroll && mainTable) {
        topScroll.addEventListener("scroll", () => {
            mainTable.scrollLeft = topScroll.scrollLeft;
        });
        mainTable.addEventListener("scroll", () => {
            topScroll.scrollLeft = mainTable.scrollLeft;
        });
    }

    // --- Lógica de Negócio ---
    // Variáveis Globais de Paginação e Dados
    let todosAtivos = [];
    let ativosFiltrados = [];
    let currentPage = 1;
    let totalPages = 1;
    const itemsPerPage = 50;
    const API_BASE = "/ativos";

    // Elementos da Paginação
    const btnPrev = document.getElementById("btnAnterior"); // Match listagem.html ID
    const btnNext = document.getElementById("btnProximo"); // Match listagem.html ID
    const pageInfo = document.getElementById("infoPaginacao"); // Match listagem.html ID

    // Handlers de Paginação
    if (btnPrev) {
        btnPrev.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderizarTabela();
            }
        });
    }

    if (btnNext) {
        btnNext.addEventListener("click", () => {
            const totalPaginas = Math.ceil(
                ativosFiltrados.length / itemsPerPage
            );
            if (currentPage < totalPaginas) {
                currentPage++;
                renderizarTabela();
            }
        });
    }

    // Elementos do Filtro
    const filtroPatrimonio = document.getElementById("filtro_patrimonio");
    const filtroStatus = document.getElementById("filtro_status");
    const filtroLocalizacao = document.getElementById("filtro_localizacao");
    const filtroResponsavel = document.getElementById("filtro_responsavel");
    const filtroMarca = document.getElementById("filtro_marca");

    // Listeners do Filtro
    filtroPatrimonio?.addEventListener("keyup", aplicarFiltros);
    filtroStatus?.addEventListener("change", aplicarFiltros);
    filtroLocalizacao?.addEventListener("change", aplicarFiltros);
    filtroResponsavel?.addEventListener("change", aplicarFiltros);
    filtroMarca?.addEventListener("keyup", aplicarFiltros);

    // Exportar CSV
    document.getElementById("btnExportar")?.addEventListener("click", exportarCSV);

    // Fechar modal de histórico
    const btnFecharHist = document.getElementById("fecharModalHistorico");
    if (btnFecharHist) {
        btnFecharHist.addEventListener("click", () => {
            document.getElementById("modalHistorico").style.display = "none";
        });
    }

    // Fechar com ESC (Histórico)
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const modalHist = document.getElementById("modalHistorico");
            if (modalHist && modalHist.style.display === "flex") {
                modalHist.style.display = "none";
            }
        }
    });

    // Logout
    document.getElementById("btnSair")?.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("usuario");
        window.location.href = "index.html";
    });

    // Helper de Mensagem (Ativo/Global) - Copiado do dashboard.js para compatibilidade com modal-ativo.js
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

    // Inicialização
    verificarLogin();
    carregarFiltros();
    carregarAtivos();

    // --- Funções Auxiliares ---
    function verificarLogin() {
        const userStr = localStorage.getItem("usuario");
        if (!userStr) {
            window.location.href = "index.html";
        }
    }

    // function carregarAtivos: Busca a lista completa de ativos no backend.
    async function carregarAtivos() {
        const divMsg = document.getElementById("divMensagemSistema");
        if (divMsg) divMsg.style.display = "none";

        try {
            const response = await fetch(API_BASE);
            if (response.ok) {
                todosAtivos = await response.json();
                ativosFiltrados = todosAtivos;
                aplicarFiltros(); // Chama filtro para atualizar totais e renderizar
            } else {
                const tbody = document.querySelector("#tabelaAtivos tbody");
                tbody.innerHTML = '<tr><td colspan="12" style="color:red; text-align:center;">Erro ao buscar ativos.</td></tr>';
            }
        } catch (error) {
            console.error("Erro:", error);
            mostrarMensagem("divMensagemSistema", "Erro de conexão.", true);
        }
    }
    window.carregarAtivos = carregarAtivos;
    window.mostrarMensagem = mostrarMensagem;

    // Helper de Mensagem
    function mostrarMensagem(elementId, texto, isErro = false) {
        const divMsg = document.getElementById(elementId);
        if (!divMsg) return;

        divMsg.innerText = texto;
        divMsg.style.display = "block";

        if (isErro) {
            divMsg.style.backgroundColor = "#fee2e2";
            divMsg.style.color = "#991b1b";
            divMsg.style.border = "none";
        } else {
            divMsg.style.backgroundColor = "#d1fae5";
            divMsg.style.color = "#065f46";
            divMsg.style.border = "none";
        }

        setTimeout(() => {
            divMsg.style.display = "none";
        }, 5000);
    }

    // Carregar Opções de Filtros
    async function carregarFiltros() {
        try {
            // Carregar Status
            const resStatus = await fetch("/ativos/status");
            if (resStatus.ok) {
                const statuses = await resStatus.json();
                const selectFiltro = document.getElementById("filtro_status");
                if (selectFiltro) {
                    // Manter opção default
                    selectFiltro.innerHTML = '<option value="">Todos</option>';
                    statuses.forEach((s) => {
                        const opt = document.createElement("option");
                        opt.value = s.status_id;
                        opt.textContent = s.descricao;
                        selectFiltro.appendChild(opt);
                    });
                }
            }
            // Carregar Localizações
            const resLocais = await fetch("/ativos/localizacoes");
            if (resLocais.ok) {
                const locais = await resLocais.json();
                const selectFiltro = document.getElementById("filtro_localizacao");
                if (selectFiltro) {
                    selectFiltro.innerHTML = '<option value="">Todas</option>';
                    locais.forEach((l) => {
                        const opt = document.createElement("option");
                        opt.value = l.localizacao_id;
                        opt.textContent = l.setor_sala;
                        selectFiltro.appendChild(opt);
                    });
                }
            }
            // Carregar Responsáveis
            const resResp = await fetch("/users/perfis");
            if (resResp.ok) {
                const responsaveis = await resResp.json();
                const selectFiltro = document.getElementById("filtro_responsavel");
                if (selectFiltro) {
                    selectFiltro.innerHTML = '<option value="">Todos</option>';
                    responsaveis.forEach((r) => {
                        const opt = document.createElement("option");
                        opt.value = r.responsavel_id;
                        opt.textContent = r.nome;
                        selectFiltro.appendChild(opt);
                    });
                }
            }
        } catch (error) {
            console.error("Erro ao carregar filtros:", error);
        }
    }

    // Lógica de Filtragem e Renderização
    function aplicarFiltros() {
        const fPatrimonio = filtroPatrimonio ? filtroPatrimonio.value.toLowerCase() : "";
        const fStatus = filtroStatus ? filtroStatus.value : "";
        const fLocal = filtroLocalizacao ? filtroLocalizacao.value : "";
        const fResp = filtroResponsavel ? filtroResponsavel.value : "";
        const fMarca = filtroMarca ? filtroMarca.value.toLowerCase() : "";

        ativosFiltrados = todosAtivos.filter((ativo) => {
            const conferePat = (ativo.patrimonio || "").toLowerCase().includes(fPatrimonio);
            const confereStatus = fStatus === "" || ativo.id_status == fStatus;
            const confereLocal = fLocal === "" || ativo.id_localizacao == fLocal;
            const confereResp = fResp === "" || ativo.id_responsavel == fResp;
            const confereMarca = (ativo.marca_modelo || "").toLowerCase().includes(fMarca);

            return conferePat && confereStatus && confereLocal && confereResp && confereMarca;
        });

        // Resetar para página 1
        currentPage = 1;
        renderizarTabela();
    }

    function renderizarTabela() {
        const tbody = document.querySelector("#tabelaAtivos tbody");
        tbody.innerHTML = "";

        const filtrados = ativosFiltrados || [];
        const totalPaginas = Math.ceil(filtrados.length / itemsPerPage);
        // Ensure currentPage is valid
        if (currentPage > totalPaginas && totalPaginas > 0) currentPage = totalPaginas;
        if (totalPaginas === 0) currentPage = 1;

        // Atualizar info de paginação
        if (pageInfo) {
            pageInfo.innerText = `Página ${currentPage} de ${totalPaginas || 1
                } (Total: ${filtrados.length})`;
        }
        if (btnPrev) btnPrev.disabled = currentPage === 1;
        if (btnNext) btnNext.disabled = currentPage >= totalPaginas || totalPaginas === 0;

        if (filtrados.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="12" style="text-align:center">Nenhum ativo encontrado.</td></tr>';
            return;
        }

        // Slice para página atual
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginados = filtrados.slice(start, end);

        paginados.forEach((ativo) => {
            const statusTexto = ativo.status_nome || "-";
            const tipoTexto = ativo.tipo_ativo_nome || "-";
            const localTexto = ativo.localizacao_nome || "-";
            const respTexto = ativo.responsavel_nome || "-";

            const badgeClass = obterClasseStatus(ativo.id_status, statusTexto);

            const tr = document.createElement("tr");
            tr.innerHTML = `
                      <td><strong>${ativo.patrimonio}</strong></td>
                      <td>${tipoTexto}</td>
                      <td>${ativo.marca_modelo || "-"}</td>
                      <td>${ativo.numero_serie || "-"}</td>
                      <td>${ativo.tipo_armazenamento || "-"}</td>
                      <td>${ativo.capacidade_armazenamento || "-"}</td>
                      <td>${ativo.valor_manutencao ? parseFloat(ativo.valor_manutencao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : "-"}</td>
                      <td><span class="badge ${badgeClass}">${statusTexto}</span></td>
                      <td><div class="cell-truncate" title="${localTexto}">${localTexto}</div></td>
                      <td><div class="cell-truncate" title="${respTexto}">${respTexto}</div></td>
                      <td><div class="cell-truncate" title="${ativo.obs || ""
                }">${ativo.obs || "-"}</div></td>
                      <td style="display: flex; gap: 4px; justify-content: center;">
                          <button class="btn-table-action btn-acao-editar" onclick='window.abrirModalEdicao(${JSON.stringify(ativo)})'>
                              <i class="fa-solid fa-pen-to-square"></i> EDITAR
                          </button>
                          <button class="btn-table-action btn-acao-historico" onclick="window.abrirHistorico(${ativo.id
                })">
                              <i class="fa-solid fa-clock-rotate-left"></i>
                          </button>
                      </td>
                  `;
            tbody.appendChild(tr);
        });

        // Update top scroll width
        const topScrollContent = document.getElementById("topScrollContent");
        const tableWidth = document.querySelector("#tabelaAtivos")?.scrollWidth;
        if (topScrollContent && tableWidth) {
            topScrollContent.style.width = tableWidth + "px";
        }
    }

    function obterClasseStatus(statusId, statusNome) {
        if (statusNome) {
            const s = statusNome.toLowerCase();
            if (s.includes("estoque")) return "badge-success"; // Verde
            if (s.includes("uso")) return "badge-info";       // Azul
            if (s.includes("manute")) return "badge-warning"; // Laranja
            if (s.includes("descartado") || s.includes("baixa")) return "badge-danger"; // Vermelho
        }

        // Fallback p/ IDs antigos se nome nulo
        if (statusId == 1) return "badge-success";
        if (statusId == 2) return "badge-info"; // Assumindo que 2 é comum para Em Uso se 13 estiver errado
        if (statusId == 13) return "badge-info";
        if (statusId == 14) return "badge-warning";
        if (statusId == 3) return "badge-danger";

        return "badge-info"; // Azul Padrão
    }

    function exportarCSV() {
        if (!ativosFiltrados || ativosFiltrados.length === 0) {
            alert("Nenhum dado para exportar.");
            return;
        }
        // Cabeçalho compatível com Excel PT-BR (ponto e vírgula como separador)
        let csv = "Patrimônio;Tipo;Marca/Modelo;Nº Série;Tipo Arm.;Capacidade;Valor Manutenção;Status;Localização;Responsável;Observação\n";

        ativosFiltrados.forEach((a) => {
            const val = a.valor_manutencao ? parseFloat(a.valor_manutencao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : "";
            const linha = [
                `"${a.patrimonio || ""}"`,
                `"${a.tipo_ativo_nome || ""}"`,
                `"${a.marca_modelo || ""}"`,
                `"${a.numero_serie || ""}"`,
                `"${a.tipo_armazenamento || ""}"`,
                `"${a.capacidade_armazenamento || ""}"`,
                `"${val}"`,
                `"${a.status_nome || ""}"`,
                `"${a.localizacao_nome || ""}"`,
                `"${a.responsavel_nome || ""}"`,
                `"${(a.obs || "").replace(/"/g, '""')}"`,
            ];
            csv += linha.join(";") + "\n";
        });

        // Adiciona BOM para garantir que caracteres especiais (acentos) apareçam corretamente no Excel
        const bom = "\uFEFF";
        const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "ativos_export.csv");
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Expor funções globais para onclick no HTML
    window.abrirModalEdicao = function (ativo) {
        if (typeof ModalAtivo !== "undefined") {
            ModalAtivo.abrirParaEdicao(ativo);
        } else {
            console.error("ModalAtivo não carregado.");
        }
    };

    // --- LÓGICA DO HISTÓRICO ---
    const modalHistorico = document.getElementById("modalHistorico");

    // Fechar modal ao clicar fora
    // window.onclick removido para evitar fechamento ao clicar fora
    window.abrirHistorico = async function (idAtivo) {
        // Encontra dados do ativo para o título (opcional, mas bom ter)
        const ativo = todosAtivos.find(a => a.id === idAtivo || a.id === String(idAtivo));

        const modalHist = document.getElementById("modalHistorico");
        const tbody = document.getElementById("tbodyHistorico"); // Corresponde ao ID no HTML atualizado

        if (modalHist) {
            modalHist.style.display = "flex";

            // Atualiza Títulos se os elementos existirem
            if (ativo) {
                if (document.getElementById("tituloHistorico")) document.getElementById("tituloHistorico").innerText = "Histórico do Ativo";
                if (document.getElementById("subtituloHistorico")) {
                    document.getElementById("subtituloHistorico").innerHTML = `<strong>${ativo.tipo_ativo_nome || ""} ${ativo.marca_modelo || "Ativo sem nome"}</strong> <span style="font-size:0.9em; opacity:0.8;">(Patrimônio: ${ativo.patrimonio})</span>`;
                }
            }

            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Carregando...</td></tr>';

            try {
                const res = await fetch(`/ativos/${idAtivo}/historico`);
                if (res.ok) {
                    const historico = await res.json();
                    tbody.innerHTML = "";

                    // Adiciona linha de espaçamento para respiro abaixo do cabeçalho fixo
                    const spacerRow = document.createElement("tr");
                    spacerRow.style.height = "12px";
                    spacerRow.innerHTML = '<td colspan="4" style="border:none;"></td>';
                    tbody.appendChild(spacerRow);

                    if (historico.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color: #64748b;">Nenhum histórico encontrado.</td></tr>';
                        return;
                    }

                    const createItem = (label, oldVal, newVal, isCost = false) => {
                        const arrowIcon = `<i class="fa-solid fa-arrow-right" style="font-size: 0.8em; color: #94a3b8; margin: 0 4px;"></i>`;
                        let valueDisplay = "";
                        if (oldVal && newVal && oldVal !== newVal) {
                            valueDisplay = `<span style="color:#64748b">${oldVal}</span> ${arrowIcon} <span style="font-weight:600; color:var(--ifg-green)">${newVal}</span>`;
                        } else if (newVal) {
                            valueDisplay = `<span style="font-weight:600; color:#334155">${newVal}</span>`;
                        }
                        let iconLeft = `<i class="fa-solid fa-pen" style="font-size:0.75em; color:#cbd5e1; width:14px; text-align:center;"></i>`;
                        if (isCost)
                            iconLeft = `<i class="fa-solid fa-dollar-sign" style="font-size:0.75em; color:#f59e0b; width:14px; text-align:center;"></i>`;
                        return `<div style="display: flex; align-items: center; gap: 6px; margin-top: 3px; font-size: 13px; line-height: 1.4;">
                            ${iconLeft}
                            <strong style="color: #475569; min-width: 50px;">${label}:</strong>
                            ${valueDisplay}
                        </div>`;
                    };

                    historico.forEach((h) => {
                        let alteracoes = [];

                        if (h.dados_alteracao) {
                            const campos = h.dados_alteracao.split(", ");
                            campos.forEach((campo) => {
                                const parts = campo.match(/^(.*?):\s*(.*?)\s*->\s*(.*)$/);
                                if (parts) {
                                    alteracoes.push(createItem(parts[1].trim(), parts[2].trim(), parts[3].trim()));
                                } else {
                                    const simpleParts = campo.split(":");
                                    if (simpleParts.length >= 2) {
                                        alteracoes.push(createItem(simpleParts[0].trim(), null, simpleParts.slice(1).join(":").trim()));
                                    } else {
                                        alteracoes.push(createItem("Info", null, campo));
                                    }
                                }
                            });
                        }

                        if (alteracoes.length === 0) {
                            if (h.status_anterior_nome && h.status_novo_nome && h.status_anterior_nome !== h.status_novo_nome) alteracoes.push(createItem("Status", h.status_anterior_nome, h.status_novo_nome));
                            if (h.localizacao_anterior_nome && h.localizacao_novo_nome && h.localizacao_anterior_nome !== h.localizacao_novo_nome) alteracoes.push(createItem("Local", h.localizacao_anterior_nome, h.localizacao_novo_nome));
                            if (h.responsavel_anterior_nome && h.responsavel_novo_nome && h.responsavel_anterior_nome !== h.responsavel_novo_nome) alteracoes.push(createItem("Resp", h.responsavel_anterior_nome, h.responsavel_novo_nome));
                        }
                        if (h.valor_manutencao) {
                            const vf = parseFloat(h.valor_manutencao).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
                            alteracoes.push(createItem("Custo", null, vf, true));
                        }
                        let conteudoAlteracoes = alteracoes.join("");
                        if (!conteudoAlteracoes) {
                            if (h.tipo_acao === "Cadastro") {
                                conteudoAlteracoes = `<span style="color:#16a34a; font-size:13px;"><i class="fa-solid fa-plus-circle"></i> Novo Ativo Criado</span>`;
                            } else {
                                conteudoAlteracoes = `<span style="color:#94a3b8; font-style:italic; font-size:13px;">Detalhes não registrados.</span>`;
                            }
                        }
                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                            <td style="vertical-align:top; color:#64748b; white-space:nowrap; font-size: 13px; padding: 12px 14px;">${new Date(h.data_movimentacao).toLocaleDateString("pt-BR")}</td>
                            <td style="vertical-align:top; text-align:center; padding: 12px 14px;">
                                <span class="badge ${h.tipo_acao === "Cadastro" ? "badge-success" : "badge-warning"}" style="font-size:11px; text-transform:uppercase;">${h.tipo_acao || "---"}</span>
                            </td>
                            <td style="vertical-align:top; font-weight:600; color:#334155; white-space:nowrap; text-align:center; font-size: 13px; padding: 12px 14px;">${h.responsavel || "Sistema"}</td>
                            <td style="vertical-align:top; padding: 12px 14px;">
                                <div style="display:flex; flex-direction:column; gap:2px;">${conteudoAlteracoes}</div>
                                ${h.observacao && !h.observacao.includes("[Alt:") ? `<div style="margin-top:6px; font-size:12px; color:#475569; background:#f8fafc; padding:4px 8px; border-radius:4px; border-left:2px solid #cbd5e1;"><strong>Obs:</strong> ${h.observacao}</div>` : ""}
                            </td>`;
                        tbody.appendChild(tr);
                    });
                } else {
                    tbody.innerHTML =
                        '<tr><td colspan="4" style="color:red; text-align:center;">Erro ao carregar os dados.</td></tr>';
                }
            } catch (err) {
                console.error(err);
                tbody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Erro: ${err.message}</td></tr>`;
            }
        }
    };
});
