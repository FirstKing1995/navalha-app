// ATENÇÃO: Coloque sua URL aqui!
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

let emailBarbeariaAtual = sessionStorage.getItem('barbeariaVisitada');
let clienteAtual = null;

let barbeiroSelecionado = null;
let servicosDoBarbeiroSelecionado = []; 
let horariosDoBarbeiroSelecionado = []; 

let servicosEscolhidos = [];
let valorTotalCalculado = 0;
let tempoTotalCalculado = 0; // Este é o tempo em minutos que o "Motor" vai usar!

let dataSelecionada = null;
let horarioSelecionado = null;

window.onload = function() {
    if (!emailBarbeariaAtual) {
        alert("Erro: Barbearia não identificada. Por favor, acesse novamente pelo link original.");
        window.location.href = 'cliente.html';
    }
};

// --- PASSO 1 (IDENTIFICAÇÃO) ---
function mostrarAreaCadastro() {
    document.getElementById('area-ja-tenho-cadastro').style.display = 'none';
    document.getElementById('area-novo-cadastro').style.display = 'block';
}

function mostrarAreaBusca() {
    document.getElementById('area-novo-cadastro').style.display = 'none';
    document.getElementById('area-ja-tenho-cadastro').style.display = 'block';
}

async function buscarCliente() {
    const whatsapp = document.getElementById('busca-whatsapp').value;
    if (!whatsapp) return;

    const btn = document.getElementById('btn-buscar-cliente');
    btn.innerText = "BUSCANDO..."; btn.disabled = true;

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ acao: 'buscarCliente', emailBarbearia: emailBarbeariaAtual, whatsapp: whatsapp })
        });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            clienteAtual = resultado.dados;
            avancarParaEscolherBarbeiro();
        } else {
            mostrarAreaCadastro();
            document.getElementById('cad-whatsapp').value = whatsapp;
        }
    } catch (erro) {
        alert("Erro de conexão.");
    } finally {
        btn.innerText = "CONTINUAR"; btn.disabled = false;
    }
}

document.getElementById('form-cadastro-cliente').addEventListener('submit', async function(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-salvar-cliente');
    btn.innerText = "SALVANDO..."; btn.disabled = true;

    const dados = {
        acao: 'cadastrarCliente',
        emailBarbearia: emailBarbeariaAtual,
        nome: document.getElementById('cad-nome').value,
        whatsapp: document.getElementById('cad-whatsapp').value,
        email: document.getElementById('cad-email').value,
        dataNascimento: document.getElementById('cad-nascimento').value
    };

    try {
        const resposta = await fetch(API_URL, { method: 'POST', body: JSON.stringify(dados) });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            clienteAtual = resultado.dados;
            avancarParaEscolherBarbeiro();
        } else {
            alert("Erro: " + resultado.mensagem);
        }
    } catch (erro) {
        alert("Erro de conexão.");
    } finally {
        btn.innerText = "CADASTRAR E CONTINUAR"; btn.disabled = false;
    }
});

// --- PASSO 2 (ESCOLHER BARBEIRO) ---
function avancarParaEscolherBarbeiro() {
    document.getElementById('passo-1-identificacao').style.display = 'none';
    document.getElementById('passo-2-barbeiros').style.display = 'block';
    document.getElementById('titulo-passo').innerText = "2. Escolher Profissional";
    buscarBarbeirosParaCliente();
}

async function buscarBarbeirosParaCliente() {
    const lista = document.getElementById('lista-barbeiros-cliente');
    try {
        const resposta = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ acao: 'buscarBarbeiros', email: emailBarbeariaAtual }) });
        const resultado = await resposta.json();
        if (resultado.status === 'sucesso') renderizarBarbeirosCliente(resultado.dados);
    } catch (erro) {
        lista.innerHTML = '<p style="color:red; text-align:center;">Erro de conexão.</p>';
    }
}

function renderizarBarbeirosCliente(barbeiros) {
    const lista = document.getElementById('lista-barbeiros-cliente');
    lista.innerHTML = '';
    barbeiros.forEach(barbeiro => {
        const servicosCodificados = encodeURIComponent(barbeiro.servicos || "[]");
        const horariosCodificados = encodeURIComponent(barbeiro.horarios || "[]");
        lista.innerHTML += `
            <div class="cartao-selecao-barbeiro" onclick="selecionarBarbeiro(${barbeiro.id}, '${barbeiro.nome}', '${servicosCodificados}', '${horariosCodificados}')">
                <div class="foto-selecao"><span class="material-symbols-rounded">face</span></div>
                <div class="info-selecao"><h3>${barbeiro.nome}</h3><p>Toque para selecionar</p></div>
                <span class="material-symbols-rounded" style="margin-left:auto; color:var(--cor-destaque);">chevron_right</span>
            </div>
        `;
    });
}

function selecionarBarbeiro(id, nome, servicosCodificados, horariosCodificados) {
    barbeiroSelecionado = { id: id, nome: nome };
    try { servicosDoBarbeiroSelecionado = JSON.parse(decodeURIComponent(servicosCodificados)); } catch(e) { servicosDoBarbeiroSelecionado = []; }
    try { horariosDoBarbeiroSelecionado = JSON.parse(decodeURIComponent(horariosCodificados)); } catch(e) { horariosDoBarbeiroSelecionado = []; }
    
    // Agora vai para os Serviços primeiro!
    avancarParaEscolherServicos();
}

// --- NOVO PASSO 3 (ESCOLHER SERVIÇOS PRIMEIRO) ---
function avancarParaEscolherServicos() {
    document.getElementById('passo-2-barbeiros').style.display = 'none';
    document.getElementById('passo-3-servicos').style.display = 'block';
    document.getElementById('titulo-passo').innerText = "3. Serviços";

    const lista = document.getElementById('lista-servicos-cliente');
    lista.innerHTML = '';

    servicosDoBarbeiroSelecionado.forEach((servico, index) => {
        const valorReal = parseFloat(servico.valor) || 0;
        const tempoReal = parseInt(servico.tempo) || 0;

        lista.innerHTML += `
            <div class="cartao-servico" id="card-srv-${index}" onclick="alternarServico(${index}, '${servico.nome}', ${valorReal}, ${tempoReal})">
                <div class="info-servico"><h4>${servico.nome}</h4><p>⏳ ${tempoReal} min</p></div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span class="preco-servico">R$ ${valorReal.toFixed(2)}</span>
                    <div class="check-servico"><span class="material-symbols-rounded" style="font-size: 16px;">check</span></div>
                </div>
            </div>
        `;
    });
}

function alternarServico(index, nome, valor, tempo) {
    const card = document.getElementById(`card-srv-${index}`);
    if (card.classList.contains('selecionado')) {
        card.classList.remove('selecionado');
        servicosEscolhidos = servicosEscolhidos.filter(s => s.nome !== nome);
        valorTotalCalculado -= valor; tempoTotalCalculado -= tempo;
    } else {
        card.classList.add('selecionado');
        servicosEscolhidos.push({ nome: nome, valor: valor, tempo: tempo });
        valorTotalCalculado += valor; tempoTotalCalculado += tempo;
    }
    atualizarRodapeTotal();
}

function atualizarRodapeTotal() {
    const rodape = document.getElementById('rodape-total');
    if (servicosEscolhidos.length > 0) {
        rodape.style.display = 'flex';
        document.getElementById('valor-total-tela').innerText = `R$ ${valorTotalCalculado.toFixed(2)}`;
        let textoTempo = `${tempoTotalCalculado} min`;
        if(tempoTotalCalculado >= 60) {
            const horas = Math.floor(tempoTotalCalculado / 60);
            const mins = tempoTotalCalculado % 60;
            textoTempo = mins > 0 ? `${horas}h ${mins} min` : `${horas}h`;
        }
        document.getElementById('tempo-total-tela').innerText = `Duração: ${textoTempo}`;
    } else {
        rodape.style.display = 'none'; 
    }
}

// --- NOVO PASSO 4 (ESCOLHER DATA E HORA COM O MOTOR INTELIGENTE) ---
function avancarParaEscolherDataHora() {
    // Esconde o rodapé flutuante dos serviços
    document.getElementById('rodape-total').style.display = 'none'; 
    document.getElementById('passo-3-servicos').style.display = 'none';
    
    document.getElementById('passo-4-data-hora').style.display = 'block';
    document.getElementById('titulo-passo').innerText = "4. Data e Horário";

    const campoData = document.getElementById('data-agendamento');
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    campoData.min = `${ano}-${mes}-${dia}`;
}

// O MOTOR INTELIGENTE QUE CALCULA O TEMPO
async function buscarHorariosDisponiveis() {
    dataSelecionada = document.getElementById('data-agendamento').value;
    document.getElementById('area-horarios').style.display = 'block';
    const lista = document.getElementById('lista-horarios');
    
    horarioSelecionado = null;
    document.getElementById('btn-continuar-resumo').style.display = 'none';

    if (!dataSelecionada) return;

    lista.innerHTML = '<p style="grid-column: span 4; text-align:center;">Verificando disponibilidade...</p>';

    const [ano, mes, dia] = dataSelecionada.split('-');
    const dataObj = new Date(ano, mes - 1, dia);
    const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const nomeDiaDaSemana = diasDaSemana[dataObj.getDay()];

    const turnoDeTrabalho = horariosDoBarbeiroSelecionado.find(h => h.dia === nomeDiaDaSemana);

    if (!turnoDeTrabalho) {
        lista.innerHTML = `<p style="grid-column: span 4; text-align:center; color: #888; font-weight: bold;">${barbeiroSelecionado.nome} não atende de ${nomeDiaDaSemana}.</p>`;
        return;
    }

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ acao: 'buscarAgendamentos', email: emailBarbeariaAtual, dataFiltro: dataSelecionada })
        });
        const resultado = await resposta.json();

        // 1. Extrai todos os agendamentos já confirmados no banco de dados e converte para "Minutos totais"
        let agendamentosDoDia = [];
        if (resultado.status === 'sucesso') {
            agendamentosDoDia = resultado.dados.filter(ag => ag.barbeiro === barbeiroSelecionado.nome).map(ag => {
                let inicioMin = converterHoraParaMinutos(ag.horario);
                let duracao = extrairMinutosDoTexto(ag.tempo);
                return { inicio: inicioMin, fim: inicioMin + duracao };
            });
        }

        // 2. Gera a grade de 30 em 30 minutos
        lista.innerHTML = '';
        const inicioTurnoMin = converterHoraParaMinutos(turnoDeTrabalho.inicio);
        const fimTurnoMin = converterHoraParaMinutos(turnoDeTrabalho.fim);

        let tempoAtual = inicioTurnoMin;
        let achouHorario = false;

        while (tempoAtual < fimTurnoMin) {
            let inicioDesteBotao = tempoAtual;
            let fimDesteBotao = tempoAtual + tempoTotalCalculado; // Adiciona o tempo que os serviços vão levar!

            // Regra 1: O serviço não pode terminar depois da hora que o barbeiro vai embora
            let passaDaHoraDeIrEmbora = fimDesteBotao > fimTurnoMin;

            // Regra 2: Verifica se esse bloco de tempo "atropela" algum agendamento que já existe
            let atropelaAlguem = agendamentosDoDia.some(ag => {
                // Se o botão começa antes do agendamento terminar E o botão termina depois do agendamento começar = CONFLITO!
                return (inicioDesteBotao < ag.fim) && (fimDesteBotao > ag.inicio);
            });

            const horaFormatada = converterMinutosParaHora(inicioDesteBotao);
            
            if (passaDaHoraDeIrEmbora || atropelaAlguem) {
                // Horário Bloqueado!
                lista.innerHTML += `<button class="btn-horario" disabled>${horaFormatada}</button>`;
            } else {
                // Horário Livre!
                lista.innerHTML += `<button class="btn-horario" id="btn-hora-${horaFormatada.replace(':','')}" onclick="selecionarHorario('${horaFormatada}')">${horaFormatada}</button>`;
                achouHorario = true;
            }

            tempoAtual += 30; // Pula para o próximo slot de 30 minutos
        }

        if (!achouHorario) {
            lista.innerHTML = '<p style="grid-column: span 4; text-align:center;">Nenhum horário disponível para acomodar esse tempo de serviço.</p>';
        }

    } catch (erro) {
        lista.innerHTML = '<p style="grid-column: span 4; text-align:center; color: red;">Erro ao verificar agenda.</p>';
    }
}

// Funções Matemáticas de Apoio
function converterHoraParaMinutos(horaTexto) {
    let [h, m] = horaTexto.split(':').map(Number);
    return (h * 60) + m;
}

function converterMinutosParaHora(minutosTotais) {
    let h = Math.floor(minutosTotais / 60).toString().padStart(2, '0');
    let m = (minutosTotais % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}

function extrairMinutosDoTexto(texto) {
    if (!texto) return 0;
    let mins = 0;
    if (texto.includes('h')) {
        let partes = texto.split('h');
        mins += parseInt(partes[0]) * 60;
        if (partes[1] && partes[1].includes('min')) mins += parseInt(partes[1].replace('min', '').trim());
    } else if (texto.includes('min')) {
        mins += parseInt(texto.replace('min', '').trim());
    } else {
        mins = parseInt(texto) || 0;
    }
    return mins;
}

function selecionarHorario(hora) {
    horarioSelecionado = hora;
    const botoes = document.querySelectorAll('.btn-horario');
    botoes.forEach(b => b.classList.remove('selecionado'));
    document.getElementById(`btn-hora-${hora.replace(':','')}`).classList.add('selecionado');
    document.getElementById('btn-continuar-resumo').style.display = 'block';
}

// --- PASSO 5 E 6 (RESUMO E CONFIRMAÇÃO) ---
function avancarParaResumo() {
    document.getElementById('passo-4-data-hora').style.display = 'none';
    document.getElementById('passo-5-resumo').style.display = 'block';
    document.getElementById('titulo-passo').innerText = "5. Resumo Final";

    const [ano, mes, dia] = dataSelecionada.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;
    const nomesServicos = servicosEscolhidos.map(s => s.nome).join(', ');

    document.getElementById('resumo-barbeiro').innerText = barbeiroSelecionado.nome;
    document.getElementById('resumo-data').innerText = dataFormatada;
    document.getElementById('resumo-hora').innerText = horarioSelecionado;
    document.getElementById('resumo-servicos').innerText = nomesServicos;
    document.getElementById('resumo-valor').innerText = `R$ ${valorTotalCalculado.toFixed(2)}`;
}

async function confirmarAgendamento() {
    const btn = document.getElementById('btn-confirmar-final');
    btn.innerText = "CONFIRMANDO..."; btn.disabled = true;

    let textoTempo = `${tempoTotalCalculado} min`;
    if(tempoTotalCalculado >= 60) {
        const horas = Math.floor(tempoTotalCalculado / 60);
        const mins = tempoTotalCalculado % 60;
        textoTempo = mins > 0 ? `${horas}h ${mins} min` : `${horas}h`;
    }

    const dados = {
        acao: 'novoAgendamento',
        emailBarbearia: emailBarbeariaAtual,
        nomeBarbeiro: barbeiroSelecionado.nome,
        nomeCliente: clienteAtual.nome,
        telefoneCliente: clienteAtual.whatsapp,
        servicos: servicosEscolhidos.map(s => s.nome).join(', '),
        valorTotal: valorTotalCalculado.toFixed(2),
        dataAgendamento: dataSelecionada,
        horario: horarioSelecionado,
        tempoTotal: textoTempo,
        dataNascimentoCliente: clienteAtual.dataNascimento || ""
    };

    try {
        const resposta = await fetch(API_URL, { method: 'POST', body: JSON.stringify(dados) });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            document.getElementById('passo-5-resumo').style.display = 'none';
            document.getElementById('passo-6-sucesso').style.display = 'block';
            document.getElementById('titulo-passo').innerText = "Concluído!";
        } else {
            alert("Erro: " + resultado.mensagem);
            btn.innerText = "TENTAR NOVAMENTE"; btn.disabled = false;
        }
    } catch (erro) {
        alert("Erro de conexão.");
        btn.innerText = "TENTAR NOVAMENTE"; btn.disabled = false;
    }
}

function enviarWhatsAppBarbeiro() {
    const dataFormatada = dataSelecionada.split('-').reverse().join('/');
    const mensagem = `Olá! Acabei de agendar um horário.\n\n👤 Cliente: ${clienteAtual.nome}\n✂️ Profissional: ${barbeiroSelecionado.nome}\n📅 Data: ${dataFormatada} às ${horarioSelecionado}\n💈 Serviços: ${servicosEscolhidos.map(s => s.nome).join(', ')}\n💰 Total: R$ ${valorTotalCalculado.toFixed(2)}`;
    const numeroBarbearia = sessionStorage.getItem('whatsappBarbearia') || '';
    const numeroLimpo = numeroBarbearia.replace(/\D/g, '');
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=55${numeroLimpo}&text=${encodeURIComponent(mensagem)}`;
    window.open(urlWhatsApp, '_blank');
}

function ativarNotificacoesCliente() {
    alert("Em breve: Lembretes no seu celular!");
}

function voltarAoInicioCliente() {
    const codigoBarbearia = btoa(emailBarbeariaAtual);
    window.location.href = `cliente.html?b=${codigoBarbearia}`;
}
