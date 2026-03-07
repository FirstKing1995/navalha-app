// ATENÇÃO: Coloque sua URL aqui!
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

window.onload = function() {
    if (localStorage.getItem('adminLogado') !== 'sim') {
        window.location.href = 'admin.html';
        return;
    }
    buscarChamadosSuporte();
};

async function buscarChamadosSuporte() {
    const listaHTML = document.getElementById('lista-chamados-admin');
    
    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ acao: 'buscarSuporteAdmin' })
        });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            renderizarChamados(resultado.dados);
        } else {
            listaHTML.innerHTML = `<p style="color:red; text-align:center;">Erro: ${resultado.mensagem}</p>`;
        }
    } catch (erro) {
        listaHTML.innerHTML = '<p style="color:red; text-align:center;">Erro de conexão.</p>';
    }
}

function renderizarChamados(lista) {
    const container = document.getElementById('lista-chamados-admin');
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888;">Caixa de entrada vazia. Nenhum chamado no momento.</p>';
        return;
    }

    lista.forEach(chamado => {
        let areaResposta = '';

        if (chamado.status === 'Aberto') {
            // Se está aberto, mostra o campo para o Admin digitar a resposta
            areaResposta = `
                <div class="area-resposta-admin" id="area-resp-${chamado.linha}">
                    <textarea id="texto-resp-${chamado.linha}" placeholder="Digite sua resposta para a barbearia..."></textarea>
                    <button class="btn-principal" onclick="enviarResposta(${chamado.linha})">
                        <span class="material-symbols-rounded" style="font-size: 18px; vertical-align: middle;">send</span> ENVIAR RESPOSTA
                    </button>
                </div>
            `;
        } else {
            // Se já foi respondido, mostra a resposta que o Admin deu
            areaResposta = `
                <div class="resposta-enviada">
                    <b>Sua resposta:</b><br>${chamado.resposta}
                </div>
            `;
        }

        const cartao = `
            <div class="cartao-suporte-admin">
                <div class="cabecalho-chamado">
                    <span class="remetente-chamado">${chamado.remetente}</span>
                    <span class="data-chamado">${chamado.data}</span>
                </div>
                
                <div class="mensagem-cliente-admin">
                    " ${chamado.mensagem} "
                </div>

                ${areaResposta}
            </div>
        `;
        container.innerHTML += cartao;
    });
}

async function enviarResposta(linha) {
    const textoResposta = document.getElementById(`texto-resp-${linha}`).value.trim();
    if (!textoResposta) {
        alert("Por favor, digite uma resposta antes de enviar.");
        return;
    }

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ acao: 'responderSuporte', linha: linha, resposta: textoResposta })
        });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            alert("Resposta enviada com sucesso!");
            buscarChamadosSuporte(); // Recarrega a tela para mostrar a mensagem verde
        } else {
            alert("Erro: " + resultado.mensagem);
        }
    } catch (erro) {
        alert("Erro de conexão ao enviar resposta.");
    }
}
