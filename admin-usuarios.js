// ATENÇÃO: Coloque o seu URL aqui!
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

let todosUsuarios = []; // Guardar a lista para a pesquisa funcionar

window.onload = function() {
    if (localStorage.getItem('adminLogado') !== 'sim') {
        window.location.href = 'admin.html';
        return;
    }
    buscarUsuariosDoSistema();
};

async function buscarUsuariosDoSistema() {
    const listaHTML = document.getElementById('lista-usuarios-admin');
    
    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ acao: 'buscarUsuariosAdmin' })
        });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            todosUsuarios = resultado.dados;
            renderizarUsuarios(todosUsuarios);
        } else {
            listaHTML.innerHTML = `<p style="color:red; text-align:center;">Erro: ${resultado.mensagem}</p>`;
        }
    } catch (erro) {
        listaHTML.innerHTML = '<p style="color:red; text-align:center;">Erro de ligação ao servidor.</p>';
    }
}

function renderizarUsuarios(lista) {
    const container = document.getElementById('lista-usuarios-admin');
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888;">Nenhuma barbearia encontrada.</p>';
        return;
    }

    lista.forEach(user => {
        // Lógica de cores e botões baseada no status
        const isAtivo = (user.status === "Ativo");
        const classeCartao = isAtivo ? "ativo" : "inativo";
        const classeBadge = isAtivo ? "bg-ativo" : "bg-inativo";
        const textoBadge = isAtivo ? "ATIVO" : "SUSPENSO";
        
        // Botões de Ação
        let botoesHTML = "";
        if (isAtivo) {
            botoesHTML = `<button class="btn-acao-admin btn-admin-vermelho" onclick="alterarStatus(${user.linha}, 'Inativo')">SUSPENDER ACESSO</button>`;
        } else {
            botoesHTML = `<button class="btn-acao-admin btn-admin-verde" onclick="alterarStatus(${user.linha}, 'Ativo')">ATIVAR / APROVAR</button>`;
        }

        const cartao = `
            <div class="cartao-usuario-admin ${classeCartao}">
                <div class="cabecalho-user-admin">
                    <div>
                        <h3>${user.nome}</h3>
                        <p>ID: #${user.id} | Registado a: ${user.dataCadastro}</p>
                    </div>
                    <span class="badge-status-admin ${classeBadge}">${textoBadge}</span>
                </div>
                
                <div class="dados-user-admin">
                    <p><span class="material-symbols-rounded" style="font-size: 16px; color: var(--cor-destaque);">mail</span> ${user.email}</p>
                    <p><span class="material-symbols-rounded" style="font-size: 16px; color: #25D366;">call</span> ${user.whatsapp}</p>
                </div>

                <div class="acoes-user-admin">
                    ${botoesHTML}
                </div>
            </div>
        `;
        container.innerHTML += cartao;
    });
}

// Filtro da barra de pesquisa
function filtrarUsuarios() {
    const termo = document.getElementById('pesquisa-barbearia').value.toLowerCase();
    const listaFiltrada = todosUsuarios.filter(u => 
        u.nome.toLowerCase().includes(termo) || 
        u.email.toLowerCase().includes(termo)
    );
    renderizarUsuarios(listaFiltrada);
}

// Chamar a API para mudar o Status e bloquear/desbloquear o cliente
async function alterarStatus(linha, novoStatus) {
    const confirmacao = confirm(`Tem a certeza que deseja mudar o status deste cliente para ${novoStatus}?`);
    if (!confirmacao) return;

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ acao: 'mudarStatusUsuario', linha: linha, novoStatus: novoStatus })
        });
        const resultado = await resposta.json();

        if (resultado.status === 'sucesso') {
            // Atualiza a lista na tela imediatamente
            buscarUsuariosDoSistema(); 
        } else {
            alert("Erro: " + resultado.mensagem);
        }
    } catch (erro) {
        alert("Erro de ligação.");
    }
}
