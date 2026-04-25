const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
const notas = JSON.parse(localStorage.getItem("notas")) || [];

const $ = id => document.getElementById(id);

function salvar() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
  localStorage.setItem("notas", JSON.stringify(notas));
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));

    $(btn.dataset.page).classList.add("active");
    btn.classList.add("active");
    $("pageTitle").innerText = btn.innerText;
  });
});

function abrirModalTarefa() {
  $("modalTarefa").classList.add("active");
}

function fecharModalTarefa() {
  $("modalTarefa").classList.remove("active");
}

$("formTarefa").addEventListener("submit", e => {
  e.preventDefault();

  tarefas.push({
    id: Date.now(),
    titulo: $("tarefaTitulo").value,
    data: $("tarefaData").value,
    status: "Pendente"
  });

  $("formTarefa").reset();
  fecharModalTarefa();
  salvar();
  renderTudo();
});

$("formNota").addEventListener("submit", e => {
  e.preventDefault();

  notas.push({
    id: Date.now(),
    titulo: $("notaTitulo").value,
    texto: $("notaTexto").value
  });

  $("formNota").reset();
  salvar();
  renderTudo();
});

function excluirTarefa(id) {
  tarefas.splice(tarefas.findIndex(t => t.id === id), 1);
  salvar();
  renderTudo();
}

function concluirTarefa(id) {
  const tarefa = tarefas.find(t => t.id === id);
  tarefa.status = tarefa.status === "Concluído" ? "Pendente" : "Concluído";
  salvar();
  renderTudo();
}

function renderTudo() {
  $("listaTarefas").innerHTML = tarefas.map(t => `
    <div class="item">
      <div>
        <h4>${t.titulo}</h4>
        <p>${t.data}</p>
        <span class="badge">${t.status}</span>
      </div>
      <div>
        <button onclick="concluirTarefa(${t.id})">Status</button>
        <button onclick="excluirTarefa(${t.id})">Excluir</button>
      </div>
    </div>
  `).join("");

  $("listaDashboard").innerHTML = tarefas.slice(0, 5).map(t => `
    <div class="item">
      <h4>${t.titulo}</h4>
      <p>${t.data}</p>
    </div>
  `).join("");

  $("listaNotas").innerHTML = notas.map(n => `
    <div class="note">
      <h4>${n.titulo}</h4>
      <p>${n.texto}</p>
    </div>
  `).join("");

  $("totalPendentes").innerText = tarefas.filter(t => t.status !== "Concluído").length;
  $("totalConcluidas").innerText = tarefas.filter(t => t.status === "Concluído").length;
  $("totalAnotacoes").innerText = notas.length;
  $("tarefasHoje").innerText = tarefas.filter(t => t.data === new Date().toISOString().slice(0,10)).length;
}

function perguntarIA() {
  $("respostaIA").innerText = "IA ainda não conectada. Área visual pronta.";
}

renderTudo();