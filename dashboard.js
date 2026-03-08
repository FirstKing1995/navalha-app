// ATENÇÃO: Coloque sua URL aqui!
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

window.onload = function() {
    const emailBarbearia = localStorage.getItem('usuarioLogado');
    if (!emailBarbearia) {
        window.location.href = 'index.html';
        return;
    }
    carregarDadosDashboard(emailBarbearia);
};

async function carregarDadosDashboard(email) {
    // 1. Pega a data de hoje no formato YYYY-MM-DD
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const dataHoje = `${ano}-${mes}-${dia}`;

    try {
        // --- BUSCA O NOME DA BARBEARIA ---
        const respPerfil = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ acao: 'buscarPerfil', email: email })
        });
        const resultadoPerfil = await respPerfil.json();
        
        if (resultadoPerfil.status === 'sucesso') {
            const nomeCompleto = resultadoPerfil.dados.nome;
            const primeiroNome = nomeCompleto.split(' ')[0]; // Pega só a primeira palavra
            document.getElementById('saudacao-nome').innerText = `Olá, ${primeiroNome}!`;
        }

        // --- BUSCA OS AGENDAMENTOS DE HOJE ---
        const respAgenda = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ acao: 'buscarAgendamentos', email: email, dataFiltro: dataHoje })
        });
        const resultadoAgenda = await respAgenda.json();

        if (resultadoAgenda.status === 'sucesso') {
            const agendamentos = resultadoAgenda.dados;
            
            // Atualiza os cartões de Resumo (Quantidade e Soma de Valores)
            document.getElementById('dash-atendimentos').innerText = agendamentos.length;
            
            let faturamentoTotal = 0;
            agendamentos.forEach(ag => {
                faturamentoTotal += parseFloat(ag.valor) || 0;
            });
            document.getElementById('dash-faturamento').innerText = `R$ ${faturamentoTotal.toFixed(2)}`;

            // --- DESCUBRE QUEM É O PRÓXIMO CLIENTE ---
            const horaAtualMin = (hoje.getHours() * 60) + hoje.getMinutes();
            
            // Ordena a agenda do mais cedo para o mais tarde
            agendamentos.sort((a, b) => {
                return converterHoraParaMin(a.horario) - converterHoraParaMin(b.horario);
            });

            let achouProximo = false;

            for (let ag of agendamentos) {
                const horaAgendamentoMin = converterHoraParaMin(ag.horario);
                
                // Se o horário do agendamento for maior ou igual a hora atual, ele é o próximo!
                if (horaAgendamentoMin >= horaAtualMin) {
                    document.getElementById('dash-proximo-hora').innerText = ag.horario;
                    document.getElementById('dash-proximo-nome').innerText = ag.cliente;
                    document.getElementById('dash-proximo-servico').innerText = ag.servicos;
                    document.getElementById('dash-proximo-barbeiro').innerText = ag.barbeiro;
                    achouProximo = true;
                    break; // Pára no primeiro que encontrar no futuro
                }
            }

            // Se rodou tudo e não achou ninguém para frente, é porque o expediente já acabou!
            if (!achouProximo && agendamentos.length > 0) {
                document.getElementById('dash-proximo-hora').innerText = "Fim";
                document.getElementById('dash-proximo-nome').innerText = "Todos os clientes de hoje já foram atendidos!";
                document.getElementById('dash-proximo-servico').innerText = "-";
                document.getElementById('dash-proximo-barbeiro').innerText = "-";
            }

        } else {
            // Se não tem agendamento hoje
            document.getElementById('dash-atendimentos').innerText = "0";
            document.getElementById('dash-faturamento').innerText = "R$ 0,00";
            document.getElementById('dash-proximo-nome').innerText = "Nenhum agendamento para hoje.";
            document.getElementById('dash-proximo-hora').innerText = "--:--";
        }

    } catch (erro) {
        console.error("Erro ao carregar dashboard:", erro);
        document.getElementById('dash-proximo-nome').innerText = "Erro ao carregar dados.";
    }
}

// Função de apoio para transformar hora em número (ex: 10:30 vira 630 minutos)
function converterHoraParaMin(horaTexto) {
    if(!horaTexto) return 0;
    let [h, m] = horaTexto.split(':').map(Number);
    return (h * 60) + m;
}
