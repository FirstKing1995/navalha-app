// Variável global para guardar o link gerado e usarmos nos botões
let linkExclusivoGerado = "";

window.onload = function() {
    const emailBarbearia = localStorage.getItem('usuarioLogado');
    if (!emailBarbearia) {
        window.location.href = 'index.html';
        return;
    }

    gerarLinkParaCliente(emailBarbearia);
};

function gerarLinkParaCliente(email) {
    // 1. Pega o endereço base do seu aplicativo no GitHub
    // Exemplo: https://seunome.github.io/navalha-app/
    let urlBase = window.location.origin + window.location.pathname;
    
    // Remove o "link.html" do final da URL para ficar só a pasta do app
    urlBase = urlBase.replace('link.html', '');

    // 2. Transforma o e-mail em um código secreto (Base64)
    // Exemplo: teste@navalha.com vira dGVzdGVAbmF2YWxoYS5jb20=
    const codigoBarbearia = btoa(email);

    // 3. Monta o link final que vai apontar para a tela do cliente (que criaremos no futuro)
    linkExclusivoGerado = `${urlBase}cliente.html?b=${codigoBarbearia}`;

    // 4. Mostra o link na tela
    document.getElementById('texto-link').innerText = linkExclusivoGerado;
}

function copiarLink() {
    // A API do navegador para copiar textos para a área de transferência
    navigator.clipboard.writeText(linkExclusivoGerado).then(() => {
        // Muda o texto do botão rapidinho para dar um feedback visual
        const btn = document.querySelector('.btn-copiar');
        const textoOriginal = btn.innerHTML;
        
        btn.innerHTML = `<span class="material-symbols-rounded">check</span> COPIADO!`;
        btn.style.backgroundColor = "#4CAF50"; // Fica verde
        btn.style.color = "#FFF";

        // Depois de 2 segundos, volta ao normal
        setTimeout(() => {
            btn.innerHTML = textoOriginal;
            btn.style.backgroundColor = "var(--cor-destaque)";
            btn.style.color = "var(--cor-principal)";
        }, 2000);

    }).catch(err => {
        alert('Erro ao copiar o link. Tente selecionar o texto e copiar manualmente.');
        console.error('Erro no Clipboard:', err);
    });
}

function compartilharWhatsApp() {
    // Monta uma mensagem pronta para o cliente
    const mensagem = `Olá! Agende seu horário na nossa barbearia de forma rápida e fácil pelo nosso aplicativo: ${linkExclusivoGerado}`;
    
    // Cria o link oficial do WhatsApp
    const urlWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
    
    // Abre o WhatsApp em uma nova aba
    window.open(urlWhatsApp, '_blank');
}
