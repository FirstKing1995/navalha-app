// ATENÇÃO: Coloque sua URL aqui!
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

window.onload = function() {
    if (!localStorage.getItem('usuarioLogado')) {
        window.location.href = 'index.html';
        return;
    }
    
    // Agora, em vez do exemplo, chamamos a planilha!
    buscarBarbeirosDaPlanilha();
};

async function buscarBarbeirosDaPlanilha() {
    const emailBarbearia = localStorage.getItem('usuarioLogado');
    const lista = document.getElementById('lista-barbeiros');
    
    lista.innerHTML = '<p style="text-align:center; padding: 20px;">Carregando equipe...</p>';

    const dados = {
        acao: 'buscarBarbeiros',
        email: emailBarbearia
    };

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(dados)
        });
        const resultado = await resposta.json();

        if(resultado.status === 'sucesso') {
            renderizarBarbeiros(resultado.dados);
        } else {
            lista.innerHTML = `<p style="text-align:center; color: red;">Erro: ${resultado.mensagem}</p>`;
        }
    } catch (erro) {
        lista.innerHTML = '<p style="text-align:center; color: red;">Erro de conexão.</p>';
        console.error(erro);
    }
}

// Função que desenha os cartões na tela
function renderizarBarbeiros(barbeiros) {
    const lista = document.getElementById('lista-barbeiros');
    lista.innerHTML = ''; // Limpa a mensagem de "Carregando"

    if(barbeiros.length === 0) {
        lista.innerHTML = '<p style="text-align:center; color: #777; padding: 20px;">Nenhum profissional cadastrado.</p>';
        return;
    }

    // Para cada barbeiro encontrado, cria um cartão
    barbeiros.forEach(barbeiro => {
        
        // Transforma aquele texto (JSON) da planilha de volta em uma lista real
        let servicos = [];
        try { 
            servicos = JSON.parse(barbeiro.servicos); 
        } catch(e) {
            console.log("Erro ao ler serviços do barbeiro", barbeiro.nome);
        }

        // Monta as pequenas etiquetas (tags) de serviços para esse barbeiro
        let htmlServicos = '';
        servicos.forEach(srv => {
            htmlServicos += `<span class="tag-servico">${srv.nome} (R$ ${srv.valor})</span>`;
        });

        // Monta o visual do Cartão
        const cartaoHTML = `
            <div class="cartao-barbeiro">
                <div class="cabecalho-barbeiro">
                    <div class="foto-barbeiro">
                        <span class="material-symbols-rounded">face</span>
                    </div>
                    <div class="info-barbeiro">
                        <h3>${barbeiro.nome}</h3>
                        <p>Atendimentos este mês: <b>0</b></p>
                    </div>
                </div>

                <div class="servicos-resumo">
                    ${htmlServicos}
                </div>

                <div class="acoes-barbeiro">
                    <button class="btn-acao btn-editar" onclick="alert('Em breve: Edição')">
                        <span class="material-symbols-rounded" style="font-size: 16px;">edit</span> Editar
                    </button>
                    <button class="btn-acao btn-duplicar" onclick="alert('Em breve: Duplicar')">
                        <span class="material-symbols-rounded" style="font-size: 16px;">content_copy</span> Duplicar
                    </button>
                    <button class="btn-acao btn-excluir" onclick="alert('Em breve: Excluir')">
                        <span class="material-symbols-rounded" style="font-size: 16px;">delete</span> Excluir
                    </button>
                </div>
            </div>
        `;
        
        lista.innerHTML += cartaoHTML; // Adiciona na tela
    });
}

function abrirFormularioBarbeiro() {
    window.location.href = 'novo-barbeiro.html';
}
