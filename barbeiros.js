// ATENÇÃO: Coloque sua URL aqui!
const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

let emailBarbeariaAtual = localStorage.getItem('usuarioLogado');
let fotoBase64Atual = ""; // Guarda a foto comprimida

// Listas temporárias para montar o visual de Serviços e Horários
let servicosTemp = [];
let horariosTemp = [];

window.onload = function() {
    if (!emailBarbeariaAtual) { window.location.href = 'index.html'; return; }
    buscarEquipe();
};

function abrirModalNovo() {
    document.getElementById('modal-barbeiro').style.display = 'flex';
    document.getElementById('form-novo-barbeiro').reset();
    document.getElementById('barbeiro-id').value = ""; // Limpa ID (é novo)
    document.getElementById('preview-foto').style.display = 'none';
    document.getElementById('titulo-modal').innerText = "Cadastrar Profissional";
    fotoBase64Atual = "";
    
    // Limpa as listas
    servicosTemp = [];
    horariosTemp = [];
    atualizarVisualServicos();
    atualizarVisualHorarios();
}

function fecharModal() {
    document.getElementById('modal-barbeiro').style.display = 'none';
}

// ==========================================
// MÁGICA 1: O COMPRESSOR DE IMAGEM
// ==========================================
document.getElementById('barbeiro-foto').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 150; // Tamanho minúsculo para não travar a planilha
            let width = img.width; let height = img.height;
            if (width > height) {
                if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
            } else {
                if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
            }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            fotoBase64Atual = canvas.toDataURL('image/jpeg', 0.6); 
            
            const preview = document.getElementById('preview-foto');
            preview.src = fotoBase64Atual;
            preview.style.display = 'block';
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
});

// ==========================================
// MÁGICA 2: ADICIONAR SERVIÇOS E HORÁRIOS
// ==========================================
function addServico() {
    const nome = document.getElementById('input-servico-nome').value.trim();
    const valor = document.getElementById('input-servico-valor').value.trim();
    const tempo = document.getElementById('input-servico-tempo').value.trim();
    
    if(!nome || !valor || !tempo) { alert("Preencha Nome, Valor e Tempo do serviço."); return; }
    
    servicosTemp.push({ nome: nome, valor: valor, tempo: tempo });
    atualizarVisualServicos();
    
    // Limpa os campos
    document.getElementById('input-servico-nome').value = '';
    document.getElementById('input-servico-valor').value = '';
    document.getElementById('input-servico-tempo').value = '';
}

function atualizarVisualServicos() {
    const div = document.getElementById('lista-servicos-adicionados');
    div.innerHTML = servicosTemp.map((s, index) => `
        <div style="display:flex; justify-content:space-between; background:#F9F9F9; padding:8px; border-radius:5px;">
            <span>${s.nome} | R$${s.valor} | ⏳${s.tempo}</span>
            <span style="color:red; cursor:pointer;" onclick="removerServico(${index})"><b>X</b></span>
        </div>
    `).join('');
}

function removerServico(index) {
    servicosTemp.splice(index, 1);
    atualizarVisualServicos();
}

function addHorario() {
    const dia = document.getElementById('input-horario-dia').value;
    const inicio = document.getElementById('input-horario-inicio').value;
    const fim = document.getElementById('input-horario-fim').value;
    
    if(!inicio || !fim) { alert("Preencha o horário de Início e Fim."); return; }
    
    horariosTemp.push({ dia: dia, inicio: inicio, fim: fim });
    atualizarVisualHorarios();
    
    document.getElementById('input-horario-inicio').value = '';
    document.getElementById('input-horario-fim').value = '';
}

function atualizarVisualHorarios() {
    const div = document.getElementById('lista-horarios-adicionados');
    div.innerHTML = horariosTemp.map((h, index) => `
        <div style="display:flex; justify-content:space-between; background:#F9F9F9; padding:8px; border-radius:5px;">
            <span>${h.dia}: ${h.inicio} às ${h.fim}</span>
            <span style="color:red; cursor:pointer;" onclick="removerHorario(${index})"><b>X</b></span>
        </div>
    `).join('');
}

function removerHorario(index) {
    horariosTemp.splice(index, 1);
    atualizarVisualHorarios();
}


// ==========================================
// REQUISITOS COM A PLANILHA (API)
// ==========================================
async function buscarEquipe() {
    const lista = document.getElementById('lista-equipe');
    lista.innerHTML = '<p style="text-align: center; color: #888;">Buscando profissionais...</p>';

    try {
        const resposta = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ acao: 'buscarBarbeiros', email: emailBarbeariaAtual }) });
        const resultado = await resposta.json();
        if (resultado.status === 'sucesso') renderizarEquipe(resultado.dados);
    } catch (erro) {
        lista.innerHTML = '<p style="color:red; text-align:center;">Erro de conexão.</p>';
    }
}

function renderizarEquipe(barbeiros) {
    const lista = document.getElementById('lista-equipe');
    lista.innerHTML = '';

    if (barbeiros.length === 0) {
        lista.innerHTML = '<p style="text-align:center; color:#888; margin-top: 20px;">Nenhum profissional cadastrado. Comece adicionando você mesmo!</p>';
        return;
    }

    barbeiros.forEach(barbeiro => {
        const bCodificado = encodeURIComponent(JSON.stringify(barbeiro));
        
        const imgTag = barbeiro.foto && barbeiro.foto.includes('data:image') ? 
            `<img src="${barbeiro.foto}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">` : 
            `<div class="foto-placeholder" style="width: 50px; height: 50px; border-radius: 50%; background: var(--cor-principal); color: var(--cor-destaque); display: flex; justify-content: center; align-items: center;"><span class="material-symbols-rounded">face</span></div>`;

        lista.innerHTML += `
            <div class="cartao-barbeiro" style="background: #FFF; border-radius: 10px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
                <div class="info-principal-barbeiro" style="display: flex; gap: 15px; align-items: center;">
                    ${imgTag}
                    <div>
                        <h3 style="margin: 0; font-size: 16px; color: var(--cor-principal);">${barbeiro.nome}</h3>
                        <p style="margin: 0; font-size: 12px; color: #777;">${barbeiro.telefone || "Sem telefone"}</p>
                    </div>
                </div>
                <div class="acoes-barbeiro" style="display: flex; gap: 8px;">
                    <button class="btn-acao btn-editar" style="background: none; border: none; color: #D4AF37; cursor: pointer; display: flex; flex-direction: column; align-items: center; font-size: 10px;" onclick="editarBarbeiro('${bCodificado}')">
                        <span class="material-symbols-rounded" style="font-size: 20px;">edit</span>
                    </button>
                    <button class="btn-acao btn-excluir" style="background: none; border: none; color: #FF4D4D; cursor: pointer; display: flex; flex-direction: column; align-items: center; font-size: 10px;" onclick="excluirBarbeiro(${barbeiro.id})">
                        <span class="material-symbols-rounded" style="font-size: 20px;">delete</span>
                    </button>
                </div>
            </div>
        `;
    });
}

function editarBarbeiro(bCodificado) {
    const barbeiro = JSON.parse(decodeURIComponent(bCodificado));
    abrirModalNovo();
    document.getElementById('titulo-modal').innerText = "Editar Profissional";
    
    document.getElementById('barbeiro-id').value = barbeiro.id;
    document.getElementById('barbeiro-nome').value = barbeiro.nome;
    document.getElementById('barbeiro-telefone').value = barbeiro.telefone || "";
    
    if (barbeiro.foto && barbeiro.foto.includes('data:image')) {
        fotoBase64Atual = barbeiro.foto;
        const preview = document.getElementById('preview-foto');
        preview.src = fotoBase64Atual;
        preview.style.display = 'block';
    }

    // Recarrega serviços e horários da memória para a tela
    try { servicosTemp = JSON.parse(barbeiro.servicos || "[]"); } catch(e) { servicosTemp = []; }
    try { horariosTemp = JSON.parse(barbeiro.horarios || "[]"); } catch(e) { horariosTemp = []; }
    
    atualizarVisualServicos();
    atualizarVisualHorarios();
}

async function excluirBarbeiro(id) {
    if(!confirm("Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita.")) return;
    try {
        const resposta = await fetch(API_URL, {
            method: 'POST', body: JSON.stringify({ acao: 'excluirBarbeiro', email: emailBarbeariaAtual, id: id })
        });
        const resultado = await resposta.json();
        if (resultado.status === 'sucesso') buscarEquipe();
        else alert(resultado.mensagem);
    } catch(e) { alert("Erro ao excluir."); }
}

document.getElementById('form-novo-barbeiro').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-salvar-form');
    btn.innerText = 'SALVANDO...'; btn.disabled = true;

    if (servicosTemp.length === 0 || horariosTemp.length === 0) {
        alert("Atenção: Você precisa cadastrar pelo menos 1 serviço e 1 horário de trabalho!");
        btn.innerText = 'SALVAR'; btn.disabled = false;
        return;
    }

    const dados = {
        acao: 'salvarBarbeiro',
        id: document.getElementById('barbeiro-id').value, 
        email: emailBarbeariaAtual,
        nome: document.getElementById('barbeiro-nome').value,
        telefone: document.getElementById('barbeiro-telefone').value,
        foto: fotoBase64Atual,
        servicos: JSON.stringify(servicosTemp),
        horarios: JSON.stringify(horariosTemp)
    };

    try {
        const resposta = await fetch(API_URL, { method: 'POST', body: JSON.stringify(dados) });
        const resultado = await resposta.json();
        if (resultado.status === 'sucesso') {
            fecharModal();
            buscarEquipe();
        } else {
            alert("Erro: " + resultado.mensagem);
        }
    } catch (erro) { alert('Erro de conexão.'); } finally {
        btn.innerText = 'SALVAR'; btn.disabled = false;
    }
});
