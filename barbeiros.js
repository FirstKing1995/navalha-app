// Verifica se o usuário está logado
window.onload = function() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        window.location.href = 'index.html';
        return;
    }

    // Carrega o barbeiro de exemplo que você pediu!
    carregarBarbeiroDeExemplo();
};

function carregarBarbeiroDeExemplo() {
    const lista = document.getElementById('lista-barbeiros');
    
    // Injetando o HTML do "Cadastro de Exemplo"
    lista.innerHTML = `
        <div class="cartao-barbeiro">
            <div class="cabecalho-barbeiro">
                <div class="foto-barbeiro">
                    <span class="material-symbols-rounded">face</span>
                </div>
                <div class="info-barbeiro">
                    <h3>Exemplo: Barbeiro João</h3>
                    <p>Atendimentos este mês: <b>24</b></p>
                </div>
            </div>

            <div class="servicos-resumo">
                <span class="tag-servico">Corte Degradê (R$ 40)</span>
                <span class="tag-servico">Barba (R$ 35)</span>
                <span class="tag-servico">Corte + Barba (R$ 70)</span>
            </div>

            <div class="acoes-barbeiro">
                <button class="btn-acao btn-editar" onclick="alert('Em breve: Tela de Edição')">
                    <span class="material-symbols-rounded" style="font-size: 16px;">edit</span>
                    Editar
                </button>
                <button class="btn-acao btn-duplicar" onclick="alert('Em breve: Duplicar Cadastro')">
                    <span class="material-symbols-rounded" style="font-size: 16px;">content_copy</span>
                    Duplicar
                </button>
                <button class="btn-acao btn-excluir" onclick="alert('Em breve: Excluir Cadastro')">
                    <span class="material-symbols-rounded" style="font-size: 16px;">delete</span>
                    Excluir
                </button>
            </div>
        </div>
    `;
}

// Função do botão principal de adicionar
function abrirFormularioBarbeiro() {
    alert("Próximo passo: Vamos criar um formulário para cadastrar o Nome, os Serviços e os Horários de Trabalho!");
}
