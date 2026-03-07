// ATENÇÃO: Coloque sua URL aqui!
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

window.onload = function() {
    const emailBarbearia = localStorage.getItem('usuarioLogado');
    if (!emailBarbearia) {
        window.location.href = 'index.html';
        return;
    }

    // Preenche o e-mail bloqueado
    document.getElementById('perfil-email').value = emailBarbearia;
    
    // Busca os dados reais na Planilha
    buscarDadosDoPerfil(emailBarbearia);
};

// --- FUNÇÃO 1: BUSCAR DADOS ---
async function buscarDadosDoPerfil(email) {
    const dados = { acao: 'buscarPerfil', email: email };

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(dados)
        });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            // Coloca o nome real no campo de texto
            document.getElementById('perfil-nome').value = resultado.dados.nome;
            
            // Atualiza o selo Cyberpunk com o status real (Ativo/Inativo)
            const seloStatus = document.querySelector('.status-neon');
            seloStatus.innerHTML = `<span class="ponto-pulsante"></span> ${resultado.dados.statusAssinatura.toUpperCase()}`;
            
            // Se estiver inativo, muda a cor do selo para vermelho para chamar atenção
            if (resultado.dados.statusAssinatura.toUpperCase() !== "ATIVO") {
                seloStatus.style.color = "#FF4D4D";
                seloStatus.style.textShadow = "0 0 10px rgba(255, 77, 77, 0.6)";
                document.querySelector('.ponto-pulsante').style.backgroundColor = "#FF4D4D";
                document.querySelector('.ponto-pulsante').style.boxShadow = "0 0 15px #FF4D4D";
            }
        } else {
            alert("Aviso: " + resultado.mensagem);
        }
    } catch (erro) {
        console.error("Erro ao buscar perfil:", erro);
    }
}

// --- FUNÇÃO 2: SALVAR ALTERAÇÕES ---
document.getElementById('form-editar-perfil').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita que a página recarregue

    const btn = document.querySelector('#form-editar-perfil .btn-principal');
    const textoOriginal = btn.innerText;
    btn.innerText = 'SALVANDO...';
    btn.disabled = true;

    const email = localStorage.getItem('usuarioLogado');
    const nome = document.getElementById('perfil-nome').value;
    const senha = document.getElementById('perfil-senha').value;

    const dados = {
        acao: 'atualizarPerfil',
        email: email,
        nome: nome,
        senha: senha // Pode estar vazio, a API sabe lidar com isso
    };

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(dados)
        });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            alert(resultado.mensagem);
            document.getElementById('perfil-senha').value = ""; // Limpa o campo de senha por segurança
            
            // Atualiza o nome lá no topo do aplicativo também (se ele estiver visível)
            const nomeTopo = document.getElementById('nome-barbearia-display');
            if(nomeTopo) nomeTopo.innerText = nome;
            
        } else {
            alert("Erro: " + resultado.mensagem);
        }
    } catch (erro) {
        alert("Erro de conexão ao salvar.");
        console.error(erro);
    } finally {
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
});

// --- FUNÇÕES DO CHAT E BOTÕES ---
function enviarMensagem() {
    const inputMsg = document.getElementById('nova-mensagem');
    const texto = inputMsg.value.trim();

    if (texto === "") return;

    const chat = document.getElementById('historico-mensagens');
    const novaDiv = document.createElement('div');
    novaDiv.className = 'mensagem msg-barbeiro';
    novaDiv.innerHTML = `<p>${texto}</p>`;

    chat.appendChild(novaDiv);
    inputMsg.value = '';
    chat.scrollTop = chat.scrollHeight;
}

document.getElementById('nova-mensagem').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') enviarMensagem();
});

function cancelarAssinatura() {
    const confirmacao = confirm("SISTEMA: Tem certeza que deseja encerrar sua conexão com o plano PRO?");
    if(confirmacao) {
        alert("Integração com Mercado Pago será necessária para processar o cancelamento.");
    }
}

function sairDoApp() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
}
