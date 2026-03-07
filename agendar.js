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

function avancarParaEscolherServicos() {
    alert(`Ótimo! Você escolheu dia ${dataSelecionada} às ${horarioSelecionado}. O próximo passo será escolher o Serviço!`);
    // Faremos o Passo 4 na próxima etapa!
}
