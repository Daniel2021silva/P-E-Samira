const materias = [
  "Matemática",
  "Português",
  "Literatura",
  "História",
  "Geografia",
  "Biologia",
  "Química",
  "Física",
  "Inglês",
  "Sociologia",
  "Ensino Religioso",
  "Redação",
  "Projeto Integrador de Humanas"
];

const STORAGE_TAREFAS = "studyflow_tarefas_local";
const STORAGE_NOTAS = "studyflow_notas_local";

let tarefas = JSON.parse(localStorage.getItem(STORAGE_TAREFAS)) || [];
let notas = JSON.parse(localStorage.getItem(STORAGE_NOTAS)) || [];

const $ = (id) => document.getElementById(id);

function salvarLocal() {
  localStorage.setItem(STORAGE_TAREFAS, JSON.stringify(tarefas));
  localStorage.setItem(STORAGE_NOTAS, JSON.stringify(notas));
}

function preencherMaterias() {
  ["tarefaMateria", "filtroMateria"].forEach(id => {
    const select = $(id);
    if (!select) return;

    let html = id === "filtroMateria"
      ? `<option value="">Todas as matérias</option>`
      : "";

    materias.forEach(materia => {
      html += `<option value="${materia}">${materia}</option>`;
    });

    select.innerHTML = html;
  });
}

function preencherFiltros() {
  $("filtroCategoria").innerHTML = `
    <option value="">Todas as categorias</option>
    <option>Escola</option>
    <option>PAVE</option>
    <option>ENEM</option>
  `;

  $("filtroStatus").innerHTML = `
    <option value="">Todos os status</option>
    <option>Pendente</option>
    <option>Fazendo</option>
    <option>Concluído</option>
  `;
}

function mudarPagina(pagina) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));

  const secao = $(pagina);
  const botao = document.querySelector(`[data-page="${pagina}"]`);

  if (secao) secao.classList.add("active");
  if (botao) botao.classList.add("active");

  const titulos = {
    dashboard: "Dashboard",
    agenda: "Agenda Escolar",
    anotacoes: "Anotações",
    cronograma: "Cronograma",
    desempenho: "Desempenho",
    ia: "Assistente IA"
  };

  $("pageTitle").innerText = titulos[pagina] || "StudyFlow";
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => mudarPagina(btn.dataset.page));
});

function abrirModalTarefa(id = null) {
  const modal = $("modalTarefa");
  const form = $("formTarefa");

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");

  if (id !== null) {
    const tarefa = tarefas.find(t => Number(t.id) === Number(id));
    if (!tarefa) return;

    $("modalTarefaTitle").innerText = "Editar tarefa";
    $("tarefaId").value = tarefa.id;
    $("tarefaTitulo").value = tarefa.titulo;
    $("tarefaMateria").value = tarefa.materia;
    $("tarefaCategoria").value = tarefa.categoria;
    $("tarefaTipo").value = tarefa.tipo;
    $("tarefaStatus").value = tarefa.status;
    $("tarefaData").value = tarefa.data;
    $("tarefaDescricao").value = tarefa.descricao || "";
  } else {
    $("modalTarefaTitle").innerText = "Nova tarefa";
    form.reset();
    $("tarefaId").value = "";
    $("tarefaStatus").value = "Pendente";
  }
}

function fecharModalTarefa() {
  $("modalTarefa").classList.remove("active");
  $("modalTarefa").setAttribute("aria-hidden", "true");
  $("formTarefa").reset();
}

$("modalTarefa").addEventListener("click", (event) => {
  if (event.target.id === "modalTarefa") {
    fecharModalTarefa();
  }
});

$("formTarefa").addEventListener("submit", (event) => {
  event.preventDefault();

  const id = $("tarefaId").value;

  const tarefa = {
    id: id ? Number(id) : Date.now(),
    titulo: $("tarefaTitulo").value.trim(),
    materia: $("tarefaMateria").value,
    categoria: $("tarefaCategoria").value,
    tipo: $("tarefaTipo").value,
    status: $("tarefaStatus").value,
    data: $("tarefaData").value,
    descricao: $("tarefaDescricao").value.trim(),
    criadoEm: new Date().toISOString()
  };

  if (!tarefa.titulo || !tarefa.data) {
    alert("Preencha o título e a data da tarefa.");
    return;
  }

  if (id) {
    tarefas = tarefas.map(item => Number(item.id) === Number(id) ? tarefa : item);
  } else {
    tarefas.push(tarefa);
  }

  salvarLocal();
  fecharModalTarefa();
  renderTudo();
});

$("formNota").addEventListener("submit", (event) => {
  event.preventDefault();

  const titulo = $("notaTitulo").value.trim();
  const texto = $("notaTexto").value.trim();

  if (!titulo || !texto) {
    alert("Preencha o título e a anotação.");
    return;
  }

  notas.unshift({
    id: Date.now(),
    titulo,
    texto,
    data: new Date().toLocaleDateString("pt-BR")
  });

  salvarLocal();
  $("formNota").reset();
  renderTudo();
});

function alternarStatus(id) {
  tarefas = tarefas.map(tarefa => {
    if (Number(tarefa.id) !== Number(id)) return tarefa;

    let novoStatus = "Pendente";

    if (tarefa.status === "Pendente") {
      novoStatus = "Fazendo";
    } else if (tarefa.status === "Fazendo") {
      novoStatus = "Concluído";
    } else {
      novoStatus = "Pendente";
    }

    return {
      ...tarefa,
      status: novoStatus
    };
  });

  salvarLocal();
  renderTudo();
}

function excluirTarefa(id) {
  if (!confirm("Deseja excluir esta tarefa?")) return;

  tarefas = tarefas.filter(tarefa => Number(tarefa.id) !== Number(id));

  salvarLocal();
  renderTudo();
}

function excluirNota(id) {
  if (!confirm("Deseja excluir esta anotação?")) return;

  notas = notas.filter(nota => Number(nota.id) !== Number(id));

  salvarLocal();
  renderTudo();
}

function renderTarefas() {
  const listaTarefas = $("listaTarefas");
  const listaDashboard = $("listaDashboard");

  let lista = [...tarefas];

  const categoria = $("filtroCategoria").value;
  const status = $("filtroStatus").value;
  const materia = $("filtroMateria").value;
  const busca = $("buscaTarefa").value.toLowerCase();

  if (categoria) lista = lista.filter(t => t.categoria === categoria);
  if (status) lista = lista.filter(t => t.status === status);
  if (materia) lista = lista.filter(t => t.materia === materia);

  if (busca) {
    lista = lista.filter(t =>
      t.titulo.toLowerCase().includes(busca) ||
      t.materia.toLowerCase().includes(busca) ||
      t.categoria.toLowerCase().includes(busca) ||
      (t.descricao || "").toLowerCase().includes(busca)
    );
  }

  lista.sort((a, b) => new Date(a.data) - new Date(b.data));

  listaTarefas.innerHTML = lista.length
    ? lista.map(cardTarefa).join("")
    : `<div class="item">Nenhuma tarefa encontrada.</div>`;

  const proximas = tarefas
    .filter(t => t.status !== "Concluído")
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .slice(0, 5);

  listaDashboard.innerHTML = proximas.length
    ? proximas.map(cardTarefa).join("")
    : `<div class="item">Nenhuma tarefa pendente.</div>`;
}

function cardTarefa(tarefa) {
  return `
    <article class="item">
      <div>
        <h4>${limpar(tarefa.titulo)}</h4>
        <p>${limpar(tarefa.descricao || "Sem descrição")}</p>

        <div class="badges">
          <span class="badge">${limpar(tarefa.materia)}</span>
          <span class="badge">${limpar(tarefa.categoria)}</span>
          <span class="badge">${limpar(tarefa.tipo)}</span>
          <span class="badge">${formatarData(tarefa.data)}</span>
          <span class="${classeStatus(tarefa.status)}">${limpar(tarefa.status)}</span>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="done" onclick="alternarStatus(${tarefa.id})">Status</button>
        <button type="button" class="edit" onclick="abrirModalTarefa(${tarefa.id})">Editar</button>
        <button type="button" class="delete" onclick="excluirTarefa(${tarefa.id})">Excluir</button>
      </div>
    </article>
  `;
}

function renderNotas() {
  const listaNotas = $("listaNotas");

  listaNotas.innerHTML = notas.length
    ? notas.map(nota => `
      <article class="note">
        <h4>${limpar(nota.titulo)}</h4>
        <div class="badges">
          <span class="badge">${limpar(nota.data)}</span>
        </div>
        <p>${limpar(nota.texto)}</p>
        <button type="button" class="delete" onclick="excluirNota(${nota.id})">Excluir</button>
      </article>
    `).join("")
    : `<div class="item">Nenhuma anotação salva.</div>`;
}

function renderResumo() {
  const hoje = new Date().toISOString().slice(0, 10);

  const pendentes = tarefas.filter(t => t.status !== "Concluído").length;
  const concluidas = tarefas.filter(t => t.status === "Concluído").length;
  const total = tarefas.length;
  const progresso = total ? Math.round((concluidas / total) * 100) : 0;

  $("totalPendentes").innerText = pendentes;
  $("totalAnotacoes").innerText = notas.length;
  $("tarefasHoje").innerText = tarefas.filter(t => t.data === hoje).length;
  $("totalConcluidas").innerText = concluidas;

  $("totalEscola").innerText = tarefas.filter(t => t.categoria === "Escola").length;
  $("totalPave").innerText = tarefas.filter(t => t.categoria === "PAVE").length;
  $("totalEnem").innerText = tarefas.filter(t => t.categoria === "ENEM").length;

  $("percentualProgresso").innerText = `${progresso}%`;
  $("barraProgresso").style.width = `${progresso}%`;
}

function renderTudo() {
  renderTarefas();
  renderNotas();
  renderResumo();
}

function perguntarIA() {
  const prompt = $("promptIA").value.trim();

  if (!prompt) {
    $("respostaIA").innerText = "Digite uma pergunta primeiro.";
    return;
  }

  $("respostaIA").innerText =
    "Área de IA preparada. Para funcionar com ChatGPT real, será necessário conectar um backend.\\n\\n" +
    "Pergunta enviada:\\n" +
    prompt;
}

function classeStatus(status) {
  if (status === "Concluído") return "badge ok";
  if (status === "Fazendo") return "badge warn";
  return "badge";
}

function formatarData(data) {
  if (!data) return "";

  const partes = data.split("-");
  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function limpar(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* deixa as funções acessíveis para os botões criados no HTML */
window.abrirModalTarefa = abrirModalTarefa;
window.fecharModalTarefa = fecharModalTarefa;
window.alternarStatus = alternarStatus;
window.excluirTarefa = excluirTarefa;
window.excluirNota = excluirNota;
window.perguntarIA = perguntarIA;
window.renderTudo = renderTudo;

preencherMaterias();
preencherFiltros();
renderTudo();