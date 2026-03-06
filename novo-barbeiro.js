const API_URL = 'https://script.google.com/macros/s/AKfycbz5w7HQLmhgptjNRTrqVkqESpCI6Fz87ld92rdtd1aeQeDb3yciEZ0R8YPlZs-qccGH/exec';

window.onload = function() {
    if (!localStorage.getItem('usuarioLogado')) {
        window.location.href = 'index.html';
    }
};

// --- Funções para adicionar campos dinâmicos na tela ---

function adicionarServico() {
    const container = document.getElementById('container-servicos');
    const div = document.createElement('div');
    div.className = 'linha-dinamica servico-item';
    div.innerHTML = `
        <input type="text" placeholder="Nome (Ex: Barba)" class="servico-nome" required>
        <input type="number" placeholder="R$" class="servico-valor" required>
        <input type="number" placeholder="Minutos" class="servico-tempo" required>
        <button type="button" class="btn-remover" onclick="this.parentElement.remove()"><span class="material-symbols-rounded">delete</span></button>
    `;
    container.appendChild(div);
}

function adicionarHorario() {
    const container = document.getElementById('container-horarios');
    const div = document.createElement('div');
    div.className = 'linha-dinamica horario-item';
    div.innerHTML = `
        <select class="horario-dia">
            <option value="Segunda">Segunda</option>
            <option value="Terça">Terça</option>
            <option value="Quarta">Quarta</option>
            <option value="Quinta">Quinta</option>
            <option value="Sexta">Sexta</option>
            <option value="Sábado">Sábado</option>
            <option value="Domingo">Domingo</option>
        </select>
        <input type="time" class="horario-inicio" required>
        <span>às</span>
        <input type="time" class="horario-fim" required>
        <button type="button" class="btn-remover" onclick="this.parentElement.remove()"><span class="material-symbols-rounded">delete</span></button>
    `;
    container.appendChild(div);
}

// --- Função para salvar tudo na planilha ---

document.getElementById('form-barbeiro').addEventListener('submit', async function(event) {
    event.preventDefault();

    const btn = document.querySelector('.btn-principal');
    btn.innerText = 'SALVANDO...';
    btn.disabled = true;

    // 1. Pega os dados básicos
    const emailBarbearia = localStorage.getItem('usuarioLogado');
    const nome = document.getElementById('nome-barbeiro').value;

    // 2. Coleta todos os serviços preenchidos
    let listaServicos = [];
    const servicosHTML = document.querySelectorAll('.servico-item');
    servicosHTML.forEach(item => {
        listaServicos.push({
            nome: item.querySelector('.servico-nome').value,
            valor: item.querySelector('.servico-valor').value,
            tempo: item.querySelector('.servico-tempo').value
        });
    });

    // 3. Coleta todos os horários preenchidos
    let listaHorarios = [];
    const horariosHTML = document.querySelectorAll('.horario-item');
    horariosHTML.forEach(item => {
        listaHorarios.push({
            dia: item.querySelector('.horario-dia').value,
            inicio: item.querySelector('.horario-inicio').value,
            fim: item.querySelector('.horario-fim').value
        });
    });

    // 4. Monta o pacote de dados
    const dados = {
        acao: 'cadastrarBarbeiro',
        emailBarbearia: emailBarbearia,
        nome: nome,
        servicos: listaServicos,
        horarios: listaHorarios
    };

    // 5. Envia para o Google Scripts
    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(dados)
        });
        const resultado = await resposta.json();

        if(resultado.status === 'sucesso') {
            alert(resultado.mensagem);
            window.location.href = 'barbeiros.html'; // Volta pra lista de equipe
        } else {
            alert('Aviso: ' + resultado.mensagem);
        }
    } catch (erro) {
        alert('Erro ao salvar. Verifique a internet.');
        console.error(erro);
    } finally {
        btn.innerText = 'SALVAR PROFISSIONAL';
        btn.disabled = false;
    }
});
