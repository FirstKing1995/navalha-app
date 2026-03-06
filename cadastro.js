// DOCUMENTAÇÃO:
// Endereço da nossa API no Google Scripts
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

document.getElementById('form-cadastro').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    // Pega os valores digitados nos campos do formulário
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const whatsapp = document.getElementById('whatsapp').value;
    const senha = document.getElementById('senha').value;

    const btn = document.querySelector('.btn-principal');
    const textoOriginal = btn.innerText;
    btn.innerText = 'CADASTRANDO...';
    btn.disabled = true;

    // Prepara o "pacote" com a ação 'cadastro'
    const dados = {
        acao: 'cadastro',
        nome: nome,
        email: email,
        whatsapp: whatsapp,
        senha: senha
    };

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if(resultado.status === 'sucesso') {
            alert(resultado.mensagem);
            // Após o cadastro, limpa o formulário e manda para a tela de login
            document.getElementById('form-cadastro').reset();
            window.location.href = 'index.html'; 
        } else {
            alert('Aviso: ' + resultado.mensagem);
        }

    } catch (erro) {
        alert('Erro de conexão. Tente novamente.');
        console.error(erro);
    } finally {
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
});
