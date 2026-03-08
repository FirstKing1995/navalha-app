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
    carregarHistoricoChat();
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

// --- FUNÇÕES DO CHAT DE SUPORTE REAIS ---

// Busca o histórico de mensagens assim que entra na tela de perfil
async function carregarHistoricoChat() {
    const email = localStorage.getItem('usuarioLogado');
    const chat = document.getElementById('historico-mensagens');
    
    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ acao: 'buscarSuporteBarbearia', email: email })
        });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            chat.innerHTML = `
                <div class="mensagem msg-admin">
                    <p>Olá! Sou o Administrador do Navalha APP. Como posso ajudar você hoje?</p>
                </div>
            `; // Reseta com a mensagem padrão de boas-vindas
            
            resultado.dados.forEach(item => {
                // 1. Mostra a pergunta da barbearia
                chat.innerHTML += `
                    <div class="mensagem msg-barbeiro">
                        <p>${item.mensagem}</p>
                    </div>
                `;
                
                // 2. Se o Admin respondeu, mostra a resposta também!
                if (item.resposta && item.resposta.trim() !== "") {
                    chat.innerHTML += `
                        <div class="mensagem msg-admin">
                            <p>${item.resposta}</p>
                        </div>
                    `;
                }
            });
            
            // Rola o chat para a última mensagem
            chat.scrollTop = chat.scrollHeight;
        }
    } catch (erro) {
        console.error("Erro ao carregar chat", erro);
    }
}

// Envia uma nova mensagem para o Admin
async function enviarMensagem() {
    const inputMsg = document.getElementById('nova-mensagem');
    const texto = inputMsg.value.trim();
    const email = localStorage.getItem('usuarioLogado');

    if (texto === "") return;

    // Desativa o botão para não enviar duplicado
    const btn = document.querySelector('.btn-enviar-msg');
    btn.disabled = true;
    inputMsg.disabled = true;

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ acao: 'enviarMensagemSuporte', emailBarbearia: email, mensagem: texto })
        });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            // Limpa o campo e recarrega o chat para mostrar a mensagem enviada
            inputMsg.value = '';
            carregarHistoricoChat();
        } else {
            alert("Erro ao enviar mensagem.");
        }
    } catch (erro) {
        alert("Erro de conexão.");
    } finally {
        btn.disabled = false;
        inputMsg.disabled = false;
        inputMsg.focus();
    }
}

// Permite enviar com a tecla Enter
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
