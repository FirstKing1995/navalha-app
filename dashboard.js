// ATENÇÃO: Coloque sua URL aqui!
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

let meuGraficoBarbearia = null;

window.onload = function() {
    const emailBarbearia = localStorage.getItem('usuarioLogado');
    if (!emailBarbearia) { window.location.href = 'index.html'; return; }
    carregarSuperDashboard(emailBarbearia);
};

async function carregarSuperDashboard(email) {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    
    const dataHoje = `${ano}-${mes}-${dia}`;
    const mesFiltro = `${ano}-${mes}`;
    const horaAtualMinutos = (hoje.getHours() * 60) + hoje.getMinutes();

    // Atualiza a data no topo da tela
    const mesesTexto = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    document.getElementById('data-hoje-texto').innerText = `Hoje, ${dia} de ${mesesTexto[hoje.getMonth()]}`;

    try {
        // Busca o nome da barbearia
        const respPerfil = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ acao: 'buscarPerfil', email: email }) });
        const resultadoPerfil = await respPerfil.json();
        if (resultadoPerfil.status === 'sucesso') {
            document.getElementById('saudacao-nome').innerText = `Olá, ${resultadoPerfil.dados.nome.split(' ')[0]}!`;
        }

        // Busca o SUPER pacote de dados do Dashboard
        const respDash = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ acao: 'buscarDashboardBarbearia', email: email, mesFiltro: mesFiltro, dataHoje: dataHoje, horaAtualMinutos: horaAtualMinutos })
        });
        const resultadoDash = await respDash.json();

        if (resultadoDash.status === 'sucesso') {
            const d = resultadoDash.dados;

            // 1. Atualiza as 4 métricas do topo
            document.getElementById('dash-fat-dia').innerText = `R$ ${d.faturamentoDia.toFixed(2)}`;
            document.getElementById('dash-fat-mes').innerText = `R$ ${d.faturamentoMes.toFixed(2)}`;
            document.getElementById('dash-cancelamentos').innerText = d.cancelamentosMes;
            document.getElementById('dash-top-servico').innerText = d.servicoTop;

            // 2. Renderiza Próximos Clientes
            const divProximos = document.getElementById('lista-proximos-clientes');
            divProximos.innerHTML = '';
            if (d.proximos.length === 0) {
                divProximos.innerHTML = '<p style="text-align: center; color: #888; font-size: 13px; padding: 15px; background: #FFF; border-radius: 12px;">Nenhum cliente agendado para as próximas horas.</p>';
            } else {
                d.proximos.forEach(cli => {
                    divProximos.innerHTML += `
                        <div class="item-proximo-cliente">
                            <div class="hora-proximo">${cli.horario}</div>
                            <div class="info-proximo-cliente">
                                <h4>${cli.cliente}</h4>
                                <p>${cli.servicos} com <b>${cli.barbeiro}</b></p>
                            </div>
                        </div>
                    `;
                });
            }

            // 3. Renderiza Ranking da Equipe
            const divEquipe = document.getElementById('ranking-equipe');
            divEquipe.innerHTML = '';
            
            // Transforma o objeto de barbeiros numa lista para poder ordenar quem ganhou mais
            let listaBarbeiros = [];
            for (let nome in d.barbeiros) {
                listaBarbeiros.push({ nome: nome, atendimentos: d.barbeiros[nome].atendimentos, faturamento: d.barbeiros[nome].faturamento });
            }
            // Ordena do maior faturamento para o menor
            listaBarbeiros.sort((a, b) => b.faturamento - a.faturamento);

            if(listaBarbeiros.length === 0) {
                divEquipe.innerHTML = '<div class="linha-equipe"><span class="dados-barbeiro-rank">Sem dados este mês.</span></div>';
            } else {
                listaBarbeiros.forEach(b => {
                    divEquipe.innerHTML += `
                        <div class="linha-equipe">
                            <span class="nome-barbeiro-rank">${b.nome}</span>
                            <span class="dados-barbeiro-rank">${b.atendimentos} cortes <br> <b>R$ ${b.faturamento.toFixed(2)}</b></span>
                        </div>
                    `;
                });
            }

            // 4. Desenhar o Gráfico de Barras do Mês
            desenharGraficoBarbearia(d.grafico, hoje.getDate());

        }
    } catch (erro) {
        console.error("Erro geral no Dashboard", erro);
    }
}

function desenharGraficoBarbearia(dadosGrafico, diaDeHoje) {
    const ctx = document.getElementById('graficoAtendimentos').getContext('2d');
    if (meuGraficoBarbearia) meuGraficoBarbearia.destroy();

    // Cria um array para os dias de 1 até o dia de hoje
    let labelsDias = [];
    let valoresAtendimentos = [];

    for (let i = 1; i <= diaDeHoje; i++) {
        labelsDias.push(i); // Eixo X (Dias 1, 2, 3...)
        // Pega o valor da API, se não tiver atendimento no dia, fica 0
        let atendimentosNoDia = dadosGrafico[i] || 0;
        valoresAtendimentos.push(atendimentosNoDia); // Eixo Y
    }

    meuGraficoBarbearia = new Chart(ctx, {
        type: 'bar', // Gráfico de Barras!
        data: {
            labels: labelsDias,
            datasets: [{
                label: 'Atendimentos',
                data: valoresAtendimentos,
                backgroundColor: '#D4AF37', // Mostarda
                borderRadius: 4 // Arredonda a ponta da barra
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } },
                x: { grid: { display: false } }
            }
        }
    });
}
