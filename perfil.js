window.onload = function() {
    const emailBarbearia = localStorage.getItem('usuarioLogado');
    if (!emailBarbearia) {
        window.location.href = 'index.html';
        return;
    }

    // Coloca o e-mail no campo bloqueado
    document.getElementById('perfil-email').value = emailBarbearia;
    
    // No próximo passo, buscaremos o nome e a assinatura reais na Planilha!
    document.getElementById('perfil-nome').value = "Buscando dados...";
};

// Função para enviar mensagem no chat
function enviarMensagem() {
    const inputMsg = document.getElementById('nova-mensagem');
    const texto = inputMsg.value.trim();

    if (texto === "") return; // Não envia mensagem vazia

    const chat = document.getElementById('historico-mensagens');

    // Cria o balão de mensagem do barbeiro
    const novaDiv = document.createElement('div');
    novaDiv.className = 'mensagem msg-barbeiro';
    novaDiv.innerHTML = `<p>${texto}</p>`;

    // Adiciona no chat
    chat.appendChild(novaDiv);

    // Limpa o campo de digitar
    inputMsg.value = '';

    // Rola o chat para o final (para ver a mensagem nova)
    chat.scrollTop = chat.scrollHeight;

    // TODO: No futuro, enviar esse texto para a aba 'Suporte' da Planilha!
}

// Permitir enviar mensagem apertando "Enter" no teclado
document.getElementById('nova-mensagem').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        enviarMensagem();
    }
});

// Botão de Cancelar Assinatura
function cancelarAssinatura() {
    const confirmacao = confirm("Tem certeza que deseja cancelar sua assinatura? Você perderá acesso às novidades após o término do período pago.");
    if(confirmacao) {
        alert("Em breve: Integração com Mercado Pago para cancelar a recorrência.");
    }
}

// Botão de Sair do App
function sairDoApp() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
}
