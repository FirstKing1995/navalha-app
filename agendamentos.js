// Verifica se está logado
window.onload = function() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        window.location.href = 'index.html';
        return;
    }

    configurarDataAtual();
    carregarAgendamentosDeTeste(); // Vamos simular os dados por enquanto
};

function configurarDataAtual() {
    const campoData = document.getElementById('filtro-data');
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    campoData.value = `${ano}-${mes}-${dia}`;
}

// Função para mostrar como as caixas vão ficar no visual
function carregarAgendamentosDeTeste() {
    const lista = document.getElementById('lista-agendamentos');
    
    // Injetando HTML direto pelo JavaScript (Dados Falsos para teste visual)
    lista.innerHTML = `
        <div class="caixa-agendamento">
            <div class="cabecalho-agendamento">
                <span class="horario-agendamento">10:00</span>
                <span class="valor-agendamento">R$ 45,00</span>
            </div>
            <div class="corpo-agendamento">
                <h3>Carlos Eduardo</h3>
                <div class="detalhes-servico">
                    <span>✂️ Corte Degradê</span>
                    <span>⏳ 45 min</span>
                </div>
            </div>
        </div>

        <div class="caixa-agendamento">
            <div class="cabecalho-agendamento">
                <span class="horario-agendamento">14:30</span>
                <span class="valor-agendamento">R$ 75,00</span>
            </div>
            <div class="corpo-agendamento">
                <h3>Marcos Silva</h3>
                <div class="detalhes-servico">
                    <span>✂️ Corte + Barba</span>
                    <span>⏳ 1h 10 min</span>
                </div>
                <div class="badge-aniversario">
                    <span class="material-symbols-rounded">cake</span>
                    É aniversário dele hoje!
                </div>
            </div>
        </div>
    `;
}

// Escuta quando o barbeiro muda a data no filtro
document.getElementById('filtro-data').addEventListener('change', function() {
    console.log("Data alterada para:", this.value);
    // No futuro, aqui chamaremos a Planilha para buscar os clientes deste dia específico!
});
