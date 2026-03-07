// ATENÇÃO: Coloque sua URL aqui!
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

document.getElementById('form-admin-login').addEventListener('submit', async function(event) {
    event.preventDefault();

    const btn = document.querySelector('.btn-principal');
    btn.innerText = 'AUTENTICANDO...';
    btn.disabled = true;

    const email = document.getElementById('admin-email').value;
    const senha = document.getElementById('admin-senha').value;

    const dados = {
        acao: 'loginAdmin',
        email: email,
        senha: senha
    };

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(dados)
        });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            // Guarda um crachá de admin
            localStorage.setItem('adminLogado', 'sim');
            window.location.href = 'admin-painel.html'; // Vamos criar essa tela a seguir!
        } else {
            alert("Acesso Negado: " + resultado.mensagem);
        }
    } catch (erro) {
        alert('Erro de conexão com o servidor.');
    } finally {
        btn.innerText = 'ENTRAR NO SISTEMA';
        btn.disabled = false;
    }
});
