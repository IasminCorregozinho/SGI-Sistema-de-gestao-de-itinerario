// Script de Login
// * Gerencia a autenticação do usuário, envio do formulário e redirecionamento.

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("loginForm");
    const inputMatricula = document.getElementById("matricula");
    const inputSenha = document.getElementById("senha");

    if (formulario) {
        // Event Listener: submit
        // Intercepta o envio do formulário, previne o reload padrão e realiza a autenticação via API.
        formulario.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Limpar mensagens de erro anteriores
            const divErro = document.getElementById("loginError");
            divErro.style.display = "none";
            divErro.innerText = "";

            const matricula = inputMatricula.value;
            const senha = inputSenha.value;

            try {
                const resposta = await fetch("/users/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ matricula, senha }),
                });

                const dados = await resposta.json();

                if (resposta.ok) {
                    // SUCESSO: Redireciona para o Dashboard


                    // Salvar dados do usuário para controle de acesso
                    localStorage.setItem("usuario", JSON.stringify(dados.user));

                    // Redireciona para o dashboard (caminho absoluto para garantir funcionamento da raiz)
                    window.location.href = "/html/dashboard.html";
                } else {
                    // ERRO: Mostrar mensagem no container
                    divErro.innerText =
                        "Nome de usuário ou senha errados. Por favor tente outra vez.";
                    divErro.style.display = "block";
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                // Erros genéricos de conexão
                divErro.innerText =
                    "Erro de conexão com o servidor. Tente novamente mais tarde.";
                divErro.style.display = "block";
            }
        });
    }
});
