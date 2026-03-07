// ATENÇÃO: Coloque sua URL aqui!
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

let meuGrafico = null; // Variável para guardar o gráfico

window.onload = function() {
    // Bloqueio de segurança
    if (localStorage.getItem('adminLogado') !== 'sim') {
        window.location.href = 'admin.html';
        return;
    }

    // Configura o filtro para o mês atual (YYYY-MM)
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    document.getElementById('filtro-mes-admin').value = `${ano}-${mes}`;

    buscarDadosSaaS();
};

async function buscarDadosSaaS() {
    const mesSelecionado = document.getElementById('filtro-mes-admin').value;

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ acao: 'buscarDashboardAdmin', mesFiltro: mesSelecionado })
        });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            document.getElementById('metrica-ativos').innerText = resultado.dados.ativos;
            document.getElementById('metrica-faturamento').innerText = `R$ ${resultado.dados.faturamento.toFixed(2)}`;
            document.getElementById('metrica-cancelamentos').innerText = resultado.dados.cancelamentos;
            document.getElementById('metrica-novos').innerText = resultado.dados.novos;

            desenharGrafico(resultado.dados.grafico);
        } else {
            alert("Erro ao carregar dados: " + resultado.mensagem);
        }
    } catch (erro) {
        console.error("Erro de conexão.", erro);
    }
}

function desenharGrafico(dadosGrafico) {
    const ctx = document.getElementById('graficoEvolucao').getContext('2d');
    
    // Se já existe um gráfico, destroi ele antes de desenhar o novo
    if (meuGrafico) {
        meuGrafico.destroy();
    }

    // Criação do Gráfico usando a biblioteca Chart.js
    meuGrafico = new Chart(ctx, {
        type: 'line', // Tipo do gráfico (Linha)
        data: {
            labels: dadosGrafico.labels, // Meses no eixo X
            datasets: [{
                label: 'Usuários Ativos',
                data: dadosGrafico.valores, // Valores no eixo Y
                borderColor: '#D4AF37', // Mostarda
                backgroundColor: 'rgba(212, 175, 55, 0.2)', // Mostarda transparente
                borderWidth: 2,
                tension: 0.4, // Faz a linha ficar curva e suave
                fill: true // Preenche a parte de baixo da linha
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }, // Esconde a legenda
            scales: {
                y: { beginAtZero: true, grid: { color: '#333' } },
                x: { grid: { color: '#333' } }
            }
        }
    });
}

function ativarNotificacoesAdmin() {
    alert("Notificações de Sistema Ativadas! Você será avisado sobre novos usuários, cancelamentos e mensagens de suporte.");
}

function sairDoAdmin() {
    localStorage.removeItem('adminLogado');
    window.location.href = 'admin.html';
}
