// DOCUMENTAÇÃO:
// Esta variável guarda o endereço da nossa "Ponte" (API) no Google Scripts
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

// Capturamos o formulário de login e "escutamos" quando o botão for clicado
document.getElementById('form-login').addEventListener('submit', async function(event) {
    
    // Evita que a página recarregue ao clicar no botão (padrão do HTML)
    event.preventDefault(); 

    // Pega os valores que o usuário digitou nos campos
    const emailDigitado = document.getElementById('email').value;
    const senhaDigitada = document.getElementById('senha').value;

    // Muda o texto do botão para dar um feedback visual ao usuário
    const btn = document.querySelector('.btn-principal');
    const textoOriginal = btn.innerText;
    btn.innerText = 'CARREGANDO...';
    btn.disabled = true; // Desativa o botão para evitar cliques duplos

    // Prepara o "pacote" de dados para enviar à planilha
    const dados = {
        acao: 'login',
        email: emailDigitado,
        senha: senhaDigitada
    };

    try {
        // O comando 'fetch' faz a chamada pela internet. O 'await' manda o código esperar a resposta.
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(dados)
        });

        // Transforma a resposta que voltou do Google em um objeto JavaScript
        const resultado = await resposta.json();

        // Verifica se a planilha respondeu com sucesso ou erro
        if(resultado.status === 'sucesso') {
            // Guarda um "crachá" no navegador para sabermos que ele está logado
            localStorage.setItem('usuarioLogado', emailDigitado);
            
            // Redireciona para a tela do Dashboard
            window.location.href = 'dashboard.html'; 
        } else {
            // Mostra o erro (ex: senha incorreta, assinatura inativa)
            alert('Aviso: ' + resultado.mensagem);
        }

    } catch (erro) {
        alert('Erro de conexão. Verifique sua internet e tente novamente.');
        console.error(erro);
    } finally {
        // Devolve o botão ao estado normal, independente de ter dado certo ou errado
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
});
