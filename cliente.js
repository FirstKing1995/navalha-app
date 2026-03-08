// ATENÇÃO: Coloque sua URL da API aqui!
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

window.onload = function() {
    // 1. Pega os códigos que estão na URL lá em cima
    const parametrosUrl = new URLSearchParams(window.location.search);
    const codigoBarbearia = parametrosUrl.get('b'); // Pega o que está depois do ?b=

    if (codigoBarbearia) {
        try {
            // 2. Desembaralha o código (Base64) para descobrir o e-mail da barbearia
            const emailBarbearia = atob(codigoBarbearia);
            
            // 3. Salva esse e-mail temporariamente no celular do cliente
            // Usamos sessionStorage porque só dura enquanto a aba estiver aberta
            sessionStorage.setItem('barbeariaVisitada', emailBarbearia);

            // 4. Vai na Planilha buscar o nome bonito da barbearia para colocar na tela
            buscarNomeDaBarbearia(emailBarbearia);

        } catch (erro) {
            alert("Erro: Link de agendamento corrompido ou inválido.");
            document.getElementById('nome-barbearia-cliente').innerText = "Link Inválido";
        }
    } else {
        alert("Erro: Este link não contém a identificação de nenhuma barbearia.");
        document.getElementById('nome-barbearia-cliente').innerText = "Barbearia não encontrada";
    }
};

// Reutilizamos a ação "buscarPerfil" que já criamos para o painel do dono!
async function buscarNomeDaBarbearia(email) {
    const dados = { acao: 'buscarPerfil', email: email };

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(dados)
        });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            document.getElementById('nome-barbearia-cliente').innerText = resultado.dados.nome;
            sessionStorage.setItem('whatsappBarbearia', resultado.dados.whatsapp);
            
            // SE TIVER LOGO, SUBSTITUI A BOLINHA "NAV" PELA IMAGEM DA LOGO!
            if (resultado.dados.logo) {
                const areaLogo = document.getElementById('logo-cliente-tela');
                areaLogo.outerHTML = `<img src="${resultado.dados.logo}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin: 0 auto 15px auto; display: block; border: 3px solid var(--cor-destaque);">`;
            }
        } else {
            document.getElementById('nome-barbearia-cliente').innerText = "Barbearia não encontrada";
        }
    } catch (erro) {
        console.error("Erro de conexão ao buscar nome:", erro);
        document.getElementById('nome-barbearia-cliente').innerText = "Erro de conexão";
    }
}

// Funções dos botões (Criaremos as telas no próximo passo)
function irParaAgendamento() {
    window.location.href = 'agendar.html';
}

function irParaConsulta() {
    window.location.href = 'consultar.html';
}
