// ATENÇÃO: Coloque sua URL aqui!
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

const emailBarbeariaAtual = sessionStorage.getItem('barbeariaVisitada');

window.onload = function() {
    if (!emailBarbeariaAtual) {
        alert("Erro: Barbearia não identificada. Por favor, acesse novamente pelo link original.");
        window.history.back();
    }
};

function voltarAoInicio() {
    const codigoBarbearia = btoa(emailBarbeariaAtual);
    window.location.href = `cliente.html?b=${codigoBarbearia}`;
}

async function consultarMeusAgendamentos() {
    const whatsapp = document.getElementById('busca-whatsapp').value.trim();
    if (!whatsapp) {
        alert("Por favor, digite seu WhatsApp.");
        return;
    }

    const btn = document.getElementById('btn-buscar');
    btn.innerText = "BUSCANDO...";
    btn.disabled = true;

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ acao: 'buscarAgendamentosCliente', emailBarbearia: emailBarbeariaAtual, whatsapp: whatsapp })
        });
        const resultado = await resposta.json();

        document.getElementById('area-resultados').style.display = 'block';
        const lista = document.getElementById('lista-meus-agendamentos');
        lista.innerHTML = '';

        if (resultado.status === 'sucesso') {
            renderizarAgendamentosEncontrados(resultado.dados);
        } else {
            lista.innerHTML = `<p style="text-align:center; color: #777;">${resultado.mensagem}</p>`;
        }
    } catch (erro) {
        alert("Erro de conexão ao buscar horários.");
    } finally {
        btn.innerText = "BUSCAR HORÁRIOS";
        btn.disabled = false;
    }
}

function renderizarAgendamentosEncontrados(agendamentos) {
    const lista = document.getElementById('lista-meus-agendamentos');

    agendamentos.forEach(ag => {
        const cartaoHTML = `
            <div class="cartao-resumo" id="agendamento-linha-${ag.linha}">
                <div class="detalhes-resumo">
                    <p><b>Data:</b> ${ag.data} às ${ag.horario}</p>
                    <p><b>Profissional:</b> ${ag.barbeiro}</p>
                    <p><b>Serviços:</b> ${ag.servicos}</p>
                    <p><b>Total:</b> R$ ${ag.valor}</p>
                </div>
                <button class="btn-cancelar-cliente" onclick="cancelarMeuAgendamento(${ag.linha})">
                    <span class="material-symbols-rounded" style="font-size: 14px; vertical-align: middle;">cancel</span> 
                    CANCELAR ESTE AGENDAMENTO
                </button>
            </div>
        `;
        lista.innerHTML += cartaoHTML;
    });
}

async function cancelarMeuAgendamento(linha) {
    const confirmacao = confirm("Tem certeza que deseja cancelar este horário? Esta ação não pode ser desfeita.");
    
    if (confirmacao) {
        try {
            const resposta = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ acao: 'cancelarAgendamento', linha: linha })
            });
            const resultado = await resposta.json();

            if (resultado.status === 'sucesso') {
                alert("Agendamento cancelado com sucesso!");
                // Esconde o cartão da tela com um efeitinho
                document.getElementById(`agendamento-linha-${linha}`).style.display = 'none';
            } else {
                alert("Erro ao cancelar: " + resultado.mensagem);
            }
        } catch (erro) {
            alert("Erro de conexão ao cancelar.");
        }
    }
}
