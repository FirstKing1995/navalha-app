// ATENÇÃO: Coloque sua URL aqui!
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

window.onload = function() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        window.location.href = 'index.html';
        return;
    }

    configurarDataAtual();
    // Em vez de carregar dados falsos, agora buscamos na planilha!
    buscarAgendamentosDaPlanilha(); 
};

function configurarDataAtual() {
    const campoData = document.getElementById('filtro-data');
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    campoData.value = `${ano}-${mes}-${dia}`;
}

// Escuta quando o barbeiro muda a data no filtro
document.getElementById('filtro-data').addEventListener('change', function() {
    buscarAgendamentosDaPlanilha(); // Busca de novo quando muda a data
});

// A Função que conversa com a planilha
async function buscarAgendamentosDaPlanilha() {
    const emailBarbearia = localStorage.getItem('usuarioLogado');
    const dataFiltro = document.getElementById('filtro-data').value;
    const lista = document.getElementById('lista-agendamentos');
    
    lista.innerHTML = '<p style="text-align:center; padding: 20px;">Carregando agenda...</p>';

    const dados = {
        acao: 'buscarAgendamentos',
        email: emailBarbearia,
        dataFiltro: dataFiltro
    };

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if(resultado.status === 'sucesso') {
            renderizarAgendamentos(resultado.dados, dataFiltro);
        } else {
            lista.innerHTML = `<p style="text-align:center; color: red;">Erro: ${resultado.mensagem}</p>`;
        }
    } catch (erro) {
        lista.innerHTML = '<p style="text-align:center; color: red;">Erro de conexão.</p>';
        console.error(erro);
    }
}

// A função que desenha as caixas na tela
function renderizarAgendamentos(agendamentos, dataFiltro) {
    const lista = document.getElementById('lista-agendamentos');
    lista.innerHTML = ''; // Limpa a mensagem de "Carregando"

    // Se não tiver ninguém agendado no dia
    if(agendamentos.length === 0) {
        lista.innerHTML = '<p style="text-align:center; color: #777; padding: 20px;">Nenhum agendamento para este dia.</p>';
        return;
    }

    // Pega o mês e dia do filtro (para comparar com o aniversário)
    const [, mesFiltro, diaFiltro] = dataFiltro.split('-');

    // Para cada agendamento recebido, cria uma caixa
    agendamentos.forEach(agendamento => {
        
        // Verifica se é aniversário do cliente
        let isAniversario = false;
        if(agendamento.dataNascimento) {
            const [, mesNasc, diaNasc] = agendamento.dataNascimento.split('-');
            if(mesNasc === mesFiltro && diaNasc === diaFiltro) {
                isAniversario = true;
            }
        }

        // Monta o visual da etiqueta se for aniversário, senão fica vazio
        const badgeAniversario = isAniversario ? `
            <div class="badge-aniversario">
                <span class="material-symbols-rounded">cake</span>
                É aniversário dele hoje!
            </div>
        ` : '';

        // Cria a caixa de HTML (AGORA COM O BOTÃO DE WHATSAPP INCLUÍDO!)
        const caixaHTML = `
            <div class="caixa-agendamento">
                <div class="cabecalho-agendamento">
                    <span class="horario-agendamento">${agendamento.horario}</span>
                    <span class="valor-agendamento">R$ ${agendamento.valor}</span>
                </div>
                <div class="corpo-agendamento">
                    <h3>${agendamento.cliente} <span style="font-size: 12px; color: #777; font-weight: normal;">(com ${agendamento.barbeiro})</span></h3>
                    <div class="detalhes-servico">
                        <span>✂️ ${agendamento.servicos}</span>
                        <span>⏳ ${agendamento.tempo}</span>
                    </div>
                    ${badgeAniversario}
                    
                    <hr style="border: none; border-top: 1px solid #EEE; margin: 15px 0 10px 0;">
                    
                    <button class="btn-voltar-simples" style="width: 100%; color:#25D366; border: 1px solid #25D366; padding: 8px; border-radius: 5px; text-decoration: none; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 5px;" onclick="chamarWhatsAppCliente('${agendamento.cliente}', '${agendamento.telefone}')">
                        <span class="material-symbols-rounded" style="font-size: 18px;">chat</span> Lembrete no WhatsApp
                    </button>

                </div>
            </div>
        `;

        lista.innerHTML += caixaHTML; // Adiciona a caixa na tela
    });
}

// --- FUNÇÃO PARA CHAMAR O WHATSAPP DO CLIENTE ---
function chamarWhatsAppCliente(nome, telefone) {
    // Verifica se o cliente tem telefone cadastrado
    if(!telefone || telefone === "undefined" || telefone.trim() === "") { 
        alert("Este cliente não possui telefone cadastrado no sistema."); 
        return; 
    }
    
    // Limpa o número (tira parênteses, traços e espaços)
    const numLimpo = telefone.replace(/\D/g, '');
    
    // Cria a mensagem e envia para o WhatsApp Web ou App
    const msg = encodeURIComponent(`Olá ${nome}, tudo bem? Aqui é da barbearia passando para confirmar o seu horário conosco hoje!`);
    window.open(`https://api.whatsapp.com/send?phone=55${numLimpo}&text=${msg}`, '_blank');
}
