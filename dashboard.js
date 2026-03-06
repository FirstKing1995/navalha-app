// Verifica se o usuário tem o "crachá" (se está logado)
window.onload = function() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    
    // Se não tiver o crachá, manda de volta pra tela de login
    if (!usuarioLogado) {
        window.location.href = 'index.html';
        return; // Para a execução do código aqui
    }

    // Configura o filtro de data para o dia atual automaticamente
    configurarDataAtual();
};

// Função para definir a data de hoje no campo de filtro
function configurarDataAtual() {
    const campoData = document.getElementById('filtro-mes');
    const hoje = new Date();
    
    // Formata a data para o padrão do HTML (Ano-Mês-Dia)
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Adiciona zero à esquerda se for mês < 10
    const dia = String(hoje.getDate()).padStart(2, '0');
    
    campoData.value = `${ano}-${mes}-${dia}`;
}

// Função para Sair do App (Logout)
function sairDoApp() {
    // Apaga o crachá
    localStorage.removeItem('usuarioLogado');
    // Volta pro login
    window.location.href = 'index.html';
}

// Função provisória para o botão de notificação
document.getElementById('btn-ativar-notificacao').addEventListener('click', function() {
    alert("Em breve: Integração com OneSignal para enviar notificações para o seu celular!");
});
