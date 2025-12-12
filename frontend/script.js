document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const matriculaInput = document.getElementById('matricula');
    const senhaInput = document.getElementById('senha');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const matricula = matriculaInput.value;
        const senha = senhaInput.value;

        // Validação básica ou log
        console.log('Tentativa de login:', {
            matricula: matricula,
            senhaLength: senha.length
        });

        try {
            const response = await fetch('http://localhost:3000/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ matricula, senha })
            });

            const data = await response.json();

            if (response.ok) {
                alert((data.message || ''));
                console.log('Dados do usuário:', data);
            } else {
                alert('Erro no login: ' + (data.error || 'Falha desconhecida'));
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Erro de conexão com o servidor.');
        }
    });
});
