// ATENÇÃO: Coloque sua URL aqui!
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

// Variável para guardar quem é a barbearia que o cliente está acessando
let emailBarbeariaAtual = sessionStorage.getItem('barbeariaVisitada');

// Variável para guardar os dados do cliente depois que ele se identificar
let clienteAtual = null;

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

function avancarParaEscolherBarbeiro() {
    alert("Perfeito! O cliente foi identificado. No próximo passo vamos mostrar a lista de barbeiros!");
    // Esconderemos o passo 1 e mostraremos o passo 2 aqui no futuro.
}
