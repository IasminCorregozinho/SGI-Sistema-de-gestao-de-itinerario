document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const matriculaInput = document.getElementById('matricula');
    const senhaInput = document.getElementById('senha');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Limpar mensagens de erro anteriores
        const errorDiv = document.getElementById('loginError');
        errorDiv.style.display = 'none';
        errorDiv.innerText = '';

        const matricula = matriculaInput.value;
        const senha = senhaInput.value;

        // Validação básica ou log
        console.log('Tentativa de login:', {
            matricula: matricula,
            senhaLength: senha.length
        });

        try {
            const response = await fetch('/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ matricula, senha })
            });

            const data = await response.json();

            if (response.ok) {
                // SUCESSO: Redireciona para o Dashboard
                console.log('Login com sucesso, redirecionando...');
                window.location.href = 'dashboard.html';
            } else {
                // ERRO: Mostrar mensagem no container
                errorDiv.innerText = "Nome de usuário ou senha errados. Por favor tente outra vez.";
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            // Erros genéricos de conexão
            errorDiv.innerText = "Erro de conexão com o servidor. Tente novamente mais tarde.";
            errorDiv.style.display = 'block';
        }
    });
});
