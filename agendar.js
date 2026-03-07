// ATENÇÃO: Coloque sua URL aqui!
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

// Variável para guardar quem é a barbearia que o cliente está acessando
let emailBarbeariaAtual = sessionStorage.getItem('barbeariaVisitada');

// Variável para guardar os dados do cliente depois que ele se identificar
let clienteAtual = null;

// Variáveis para guardar as escolhas do cliente nos próximos passos
let barbeiroSelecionado = null;
let servicosDoBarbeiroSelecionado = []; // Vamos guardar os serviços que esse barbeiro faz para usar depois!

let dataSelecionada = null;
let horarioSelecionado = null;

let servicosEscolhidos = [];
let valorTotalCalculado = 0;
let tempoTotalCalculado = 0;

window.onload = function() {
    if (!emailBarbeariaAtual) {
        alert("Erro: Barbearia não identificada. Por favor, acesse novamente pelo link original.");
        window.location.href = 'cliente.html';
    }
};

// --- FUNÇÕES DE VISUAL (TROCAR TELAS) ---
function mostrarAreaCadastro() {
    document.getElementById('area-ja-tenho-cadastro').style.display = 'none';
    document.getElementById('area-novo-cadastro').style.display = 'block';
}

function mostrarAreaBusca() {
    document.getElementById('area-novo-cadastro').style.display = 'none';
    document.getElementById('area-ja-tenho-cadastro').style.display = 'block';
}

// --- FUNÇÃO DE BUSCAR CLIENTE (JÁ TENHO CADASTRO) ---
async function buscarCliente() {
    const whatsapp = document.getElementById('busca-whatsapp').value;
    if (!whatsapp) {
        alert("Por favor, digite seu WhatsApp.");
        return;
    }

    const btn = document.getElementById('btn-buscar-cliente');
    btn.innerText = "BUSCANDO...";
    btn.disabled = true;

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ acao: 'buscarCliente', emailBarbearia: emailBarbeariaAtual, whatsapp: whatsapp })
        });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            clienteAtual = resultado.dados; // Salva o cliente na memória
            alert(`Bem-vindo de volta, ${clienteAtual.nome}!`);
            
            // PRÓXIMO PASSO DO APLICATIVO
            avancarParaEscolherBarbeiro();
        } else {
            alert("Cadastro não encontrado. Por favor, faça um novo cadastro.");
            mostrarAreaCadastro(); // Se não achou, manda ele preencher os dados
            document.getElementById('cad-whatsapp').value = whatsapp; // Já preenche o whatsapp pra ele não ter que digitar de novo!
        }
    } catch (erro) {
        alert("Erro de conexão.");
    } finally {
        btn.innerText = "CONTINUAR";
        btn.disabled = false;
    }
}

// --- FUNÇÃO DE SALVAR NOVO CLIENTE ---
document.getElementById('form-cadastro-cliente').addEventListener('submit', async function(event) {
    event.preventDefault();

    const btn = document.getElementById('btn-salvar-cliente');
    btn.innerText = "SALVANDO...";
    btn.disabled = true;

    const dados = {
        acao: 'cadastrarCliente',
        emailBarbearia: emailBarbeariaAtual,
        nome: document.getElementById('cad-nome').value,
        whatsapp: document.getElementById('cad-whatsapp').value,
        email: document.getElementById('cad-email').value,
        dataNascimento: document.getElementById('cad-nascimento').value
    };

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(dados)
        });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            clienteAtual = resultado.dados; // Salva o cliente na memória
            alert("Cadastro realizado com sucesso!");
            
            // PRÓXIMO PASSO DO APLICATIVO
            avancarParaEscolherBarbeiro();
        } else {
            alert("Erro: " + resultado.mensagem);
        }
    } catch (erro) {
        alert("Erro de conexão.");
    } finally {
        btn.innerText = "CADASTRAR E CONTINUAR";
        btn.disabled = false;
    }
});

// --- FUNÇÕES DO PASSO 2 (ESCOLHER BARBEIRO) ---

function avancarParaEscolherBarbeiro() {
    // Esconde o Passo 1 e mostra o Passo 2
    document.getElementById('passo-1-identificacao').style.display = 'none';
    document.getElementById('passo-2-barbeiros').style.display = 'block';
    
    // Atualiza o título no topo
    document.getElementById('titulo-passo').innerText = "2. Escolher Profissional";

    // Chama a API para buscar a lista
    buscarBarbeirosParaCliente();
}

async function buscarBarbeirosParaCliente() {
    const lista = document.getElementById('lista-barbeiros-cliente');
    lista.innerHTML = '<p style="text-align:center; padding:20px; color:#777;">Buscando profissionais...</p>';

    try {
        // Reutilizamos a MESMA ação que criamos para o painel do dono!
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ acao: 'buscarBarbeiros', email: emailBarbeariaAtual })
        });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            renderizarBarbeirosCliente(resultado.dados);
        } else {
            lista.innerHTML = `<p style="color:red; text-align:center;">Erro: ${resultado.mensagem}</p>`;
        }
    } catch (erro) {
        lista.innerHTML = '<p style="color:red; text-align:center;">Erro de conexão.</p>';
        console.error(erro);
    }
}

function renderizarBarbeirosCliente(barbeiros) {
    const lista = document.getElementById('lista-barbeiros-cliente');
    lista.innerHTML = '';

    if (barbeiros.length === 0) {
        lista.innerHTML = '<p style="text-align:center; color:#777;">Nenhum profissional cadastrado no momento.</p>';
        return;
    }

    barbeiros.forEach(barbeiro => {
        // Os serviços vêm da planilha em formato de texto. 
        // Vamos guardá-los no botão de forma segura para usarmos no Passo 4.
        const servicosCodificados = encodeURIComponent(barbeiro.servicos);

        const cartaoHTML = `
            <div class="cartao-selecao-barbeiro" onclick="selecionarBarbeiro(${barbeiro.id}, '${barbeiro.nome}', '${servicosCodificados}')">
                <div class="foto-selecao">
                    <span class="material-symbols-rounded">face</span>
                </div>
                <div class="info-selecao">
                    <h3>${barbeiro.nome}</h3>
                    <p>Toque para selecionar</p>
                </div>
                <span class="material-symbols-rounded" style="margin-left:auto; color:var(--cor-destaque);">chevron_right</span>
            </div>
        `;
        lista.innerHTML += cartaoHTML;
    });
}

function selecionarBarbeiro(id, nome, servicosCodificados) {
    // Salva na memória quem foi o barbeiro escolhido
    barbeiroSelecionado = { id: id, nome: nome };
    
    // Transforma o texto dos serviços de volta em uma lista e salva
    try {
        const servicosTexto = decodeURIComponent(servicosCodificados);
        servicosDoBarbeiroSelecionado = JSON.parse(servicosTexto);
    } catch(e) {
        servicosDoBarbeiroSelecionado = [];
        console.error("Erro ao ler serviços do barbeiro.");
    }

    avancarParaEscolherDataHora();
}

// --- FUNÇÕES DO PASSO 3 (ESCOLHER DATA E HORA) ---

function avancarParaEscolherDataHora() {
    document.getElementById('passo-2-barbeiros').style.display = 'none';
    document.getElementById('passo-3-data-hora').style.display = 'block';
    document.getElementById('titulo-passo').innerText = "3. Data e Horário";

    // Configura o calendário para não aceitar datas no passado
    const campoData = document.getElementById('data-agendamento');
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    campoData.min = `${ano}-${mes}-${dia}`; // 'min' impede selecionar dias anteriores
}

function buscarHorariosDisponiveis() {
    dataSelecionada = document.getElementById('data-agendamento').value;
    
    // Mostra a área de horários
    document.getElementById('area-horarios').style.display = 'block';
    const lista = document.getElementById('lista-horarios');
    
    // Limpa a seleção anterior
    horarioSelecionado = null;
    document.getElementById('btn-continuar-servicos').style.display = 'none';

    lista.innerHTML = '<p style="grid-column: span 4; text-align:center;">Carregando horários...</p>';

    // Simulação rápida de busca de horários (Depois conectaremos com a API real)
    setTimeout(() => {
        lista.innerHTML = '';
        
        // Vamos gerar alguns horários de exemplo (das 09:00 às 17:00)
        const horariosExemplo = ['09:00', '09:30', '10:00', '10:30', '11:00', '13:00', '14:00', '15:30', '16:00', '17:00'];

        horariosExemplo.forEach(hora => {
            // Vamos simular que as 10:00 e 14:00 já estão agendadas (ocupadas)
            const ocupado = (hora === '10:00' || hora === '14:00') ? 'disabled' : '';
            
            lista.innerHTML += `
                <button class="btn-horario" id="btn-hora-${hora.replace(':','')}" ${ocupado} onclick="selecionarHorario('${hora}')">
                    ${hora}
                </button>
            `;
        });
    }, 500); // Aguarda meio segundo para dar aquele efeito de "carregando..."
}

function selecionarHorario(hora) {
    horarioSelecionado = hora;

    // Remove a classe "selecionado" de todos os botões
    const botoes = document.querySelectorAll('.btn-horario');
    botoes.forEach(b => b.classList.remove('selecionado'));

    // Adiciona a classe "selecionado" apenas no botão clicado
    document.getElementById(`btn-hora-${hora.replace(':','')}`).classList.add('selecionado');

    // Mostra o botão de continuar para o próximo passo!
    document.getElementById('btn-continuar-servicos').style.display = 'block';
}

// --- FUNÇÕES DO PASSO 4 (ESCOLHER SERVIÇOS) ---

function avancarParaEscolherServicos() {
    document.getElementById('passo-3-data-hora').style.display = 'none';
    document.getElementById('passo-4-servicos').style.display = 'block';
    document.getElementById('titulo-passo').innerText = "4. Serviços";

    const lista = document.getElementById('lista-servicos-cliente');
    lista.innerHTML = '';

    if(servicosDoBarbeiroSelecionado.length === 0) {
        lista.innerHTML = '<p style="text-align:center;">Este profissional ainda não tem serviços cadastrados.</p>';
        return;
    }

    // Cria um cartão para cada serviço do barbeiro
    servicosDoBarbeiroSelecionado.forEach((servico, index) => {
        // Garantir que os números sejam tratados corretamente para a soma depois
        const valorReal = parseFloat(servico.valor) || 0;
        const tempoReal = parseInt(servico.tempo) || 0;

        lista.innerHTML += `
            <div class="cartao-servico" id="card-srv-${index}" onclick="alternarServico(${index}, '${servico.nome}', ${valorReal}, ${tempoReal})">
                <div class="info-servico">
                    <h4>${servico.nome}</h4>
                    <p>⏳ ${tempoReal} min</p>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span class="preco-servico">R$ ${valorReal.toFixed(2)}</span>
                    <div class="check-servico">
                        <span class="material-symbols-rounded" style="font-size: 16px;">check</span>
                    </div>
                </div>
            </div>
        `;
    });
}

function alternarServico(index, nome, valor, tempo) {
    const card = document.getElementById(`card-srv-${index}`);
    const taSelecionado = card.classList.contains('selecionado');

    if (taSelecionado) {
        // Desmarca o serviço
        card.classList.remove('selecionado');
        servicosEscolhidos = servicosEscolhidos.filter(s => s.nome !== nome);
        valorTotalCalculado -= valor;
        tempoTotalCalculado -= tempo;
    } else {
        // Marca o serviço
        card.classList.add('selecionado');
        servicosEscolhidos.push({ nome: nome, valor: valor, tempo: tempo });
        valorTotalCalculado += valor;
        tempoTotalCalculado += tempo;
    }

    atualizarRodapeTotal();
}

function atualizarRodapeTotal() {
    const rodape = document.getElementById('rodape-total');
    if (servicosEscolhidos.length > 0) {
        rodape.style.display = 'flex';
        document.getElementById('valor-total-tela').innerText = `R$ ${valorTotalCalculado.toFixed(2)}`;
        
        // Formata o tempo bonito (ex: 1h 30 min em vez de 90 min)
        let textoTempo = `${tempoTotalCalculado} min`;
        if(tempoTotalCalculado >= 60) {
            const horas = Math.floor(tempoTotalCalculado / 60);
            const mins = tempoTotalCalculado % 60;
            textoTempo = mins > 0 ? `${horas}h ${mins} min` : `${horas}h`;
        }
        document.getElementById('tempo-total-tela').innerText = `Tempo est.: ${textoTempo}`;
    } else {
        rodape.style.display = 'none'; // Esconde se desmarcar tudo
    }
}

// --- FUNÇÕES DO PASSO 5 (RESUMO E CONFIRMAÇÃO) ---

function avancarParaResumo() {
    document.getElementById('passo-4-servicos').style.display = 'none';
    document.getElementById('rodape-total').style.display = 'none'; // Esconde o rodapé flutuante
    
    document.getElementById('passo-5-resumo').style.display = 'block';
    document.getElementById('titulo-passo').innerText = "5. Resumo Final";

    // Pega as datas e formata bonito pro Brasil (DD/MM/YYYY)
    const [ano, mes, dia] = dataSelecionada.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;

    // Pega o nome de todos os serviços escolhidos e junta com vírgula
    const nomesServicos = servicosEscolhidos.map(s => s.nome).join(', ');

    // Preenche a tela de resumo
    document.getElementById('resumo-barbeiro').innerText = barbeiroSelecionado.nome;
    document.getElementById('resumo-data').innerText = dataFormatada;
    document.getElementById('resumo-hora').innerText = horarioSelecionado;
    document.getElementById('resumo-servicos').innerText = nomesServicos;
    document.getElementById('resumo-valor').innerText = `R$ ${valorTotalCalculado.toFixed(2)}`;
}

async function confirmarAgendamento() {
    const btn = document.getElementById('btn-confirmar-final');
    btn.innerText = "CONFIRMANDO...";
    btn.disabled = true;

    // Converte o tempo total de volta para o texto que a planilha espera
    let textoTempo = `${tempoTotalCalculado} min`;
    if(tempoTotalCalculado >= 60) {
        const horas = Math.floor(tempoTotalCalculado / 60);
        const mins = tempoTotalCalculado % 60;
        textoTempo = mins > 0 ? `${horas}h ${mins} min` : `${horas}h`;
    }

    // O "Pacotão" final de dados que vai pra planilha
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
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(dados)
        });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            alert("Agendamento Confirmado! Te esperamos na barbearia!");
            // Manda o cliente de volta pra tela inicial
            window.location.href = 'cliente.html';
        } else {
            alert("Erro: " + resultado.mensagem);
            btn.innerText = "TENTAR NOVAMENTE";
            btn.disabled = false;
        }
    } catch (erro) {
        alert("Erro de conexão ao salvar o agendamento.");
        btn.innerText = "TENTAR NOVAMENTE";
        btn.disabled = false;
    }
}
