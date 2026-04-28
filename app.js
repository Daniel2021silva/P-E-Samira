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
  const filtroCategoria = $("filtroCategoria");
  const filtroStatus = $("filtroStatus");

  if (filtroCategoria) {
    filtroCategoria.innerHTML = `
      <option value="">Todas as categorias</option>
      <option>Escola</option>
      <option>PAVE</option>
      <option>ENEM</option>
    `;
  }

  if (filtroStatus) {
    filtroStatus.innerHTML = `
      <option value="">Todos os status</option>
      <option>Pendente</option>
      <option>Fazendo</option>
      <option>Concluído</option>
    `;
  }
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

  if ($("pageTitle")) {
    $("pageTitle").innerText = titulos[pagina] || "StudyFlow";
  }
}

function abrirModalTarefa(id = null) {
  const modal = $("modalTarefa");
  const form = $("formTarefa");

  if (!modal || !form) return;

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
  const modal = $("modalTarefa");
  const form = $("formTarefa");

  if (modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }

  if (form) form.reset();
}

function salvarTarefa(event) {
  event.preventDefault();

  const id = $("tarefaId")?.value || "";

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
    tarefas = tarefas.map(item =>
      Number(item.id) === Number(id) ? tarefa : item
    );
  } else {
    tarefas.push(tarefa);
  }

  salvarLocal();
  fecharModalTarefa();
  renderTudo();
}

function salvarNota(event) {
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
    data: new Date().toLocaleDateString("pt-BR"),
    criadoEm: new Date().toISOString()
  });

  salvarLocal();
  $("formNota").reset();
  renderTudo();
}

function alternarStatus(id) {
  tarefas = tarefas.map(tarefa => {
    if (Number(tarefa.id) !== Number(id)) return tarefa;

    let novoStatus = "Pendente";

    if (tarefa.status === "Pendente") novoStatus = "Fazendo";
    else if (tarefa.status === "Fazendo") novoStatus = "Concluído";
    else novoStatus = "Pendente";

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

  const categoria = $("filtroCategoria")?.value || "";
  const status = $("filtroStatus")?.value || "";
  const materia = $("filtroMateria")?.value || "";
  const busca = $("buscaTarefa")?.value.toLowerCase() || "";

  if (categoria) lista = lista.filter(t => t.categoria === categoria);
  if (status) lista = lista.filter(t => t.status === status);
  if (materia) lista = lista.filter(t => t.materia === materia);

  if (busca) {
    lista = lista.filter(t =>
      (t.titulo || "").toLowerCase().includes(busca) ||
      (t.materia || "").toLowerCase().includes(busca) ||
      (t.categoria || "").toLowerCase().includes(busca) ||
      (t.descricao || "").toLowerCase().includes(busca)
    );
  }

  lista.sort((a, b) => new Date(a.data) - new Date(b.data));

  if (listaTarefas) {
    listaTarefas.innerHTML = lista.length
      ? lista.map(cardTarefa).join("")
      : `<div class="item">Nenhuma tarefa encontrada.</div>`;
  }

  const proximas = tarefas
    .filter(t => t.status !== "Concluído")
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .slice(0, 5);

  if (listaDashboard) {
    listaDashboard.innerHTML = proximas.length
      ? proximas.map(cardTarefa).join("")
      : `<div class="item">Nenhuma tarefa pendente.</div>`;
  }
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
        <button type="button" class="done" data-action="status" data-id="${tarefa.id}">Status</button>
        <button type="button" class="edit" data-action="editar" data-id="${tarefa.id}">Editar</button>
        <button type="button" class="delete" data-action="excluir" data-id="${tarefa.id}">Excluir</button>
      </div>
    </article>
  `;
}

function renderNotas() {
  const listaNotas = $("listaNotas");
  if (!listaNotas) return;

  listaNotas.innerHTML = notas.length
    ? notas.map(nota => `
      <article class="note">
        <h4>${limpar(nota.titulo)}</h4>

        <div class="badges">
          <span class="badge">${limpar(nota.data)}</span>
        </div>

        <p>${limpar(nota.texto)}</p>

        <button type="button" class="delete" data-action="excluirNota" data-id="${nota.id}">
          Excluir
        </button>
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

  if ($("totalPendentes")) $("totalPendentes").innerText = pendentes;
  if ($("totalAnotacoes")) $("totalAnotacoes").innerText = notas.length;
  if ($("tarefasHoje")) $("tarefasHoje").innerText = tarefas.filter(t => t.data === hoje).length;
  if ($("totalConcluidas")) $("totalConcluidas").innerText = concluidas;

  if ($("totalEscola")) $("totalEscola").innerText = tarefas.filter(t => t.categoria === "Escola").length;
  if ($("totalPave")) $("totalPave").innerText = tarefas.filter(t => t.categoria === "PAVE").length;
  if ($("totalEnem")) $("totalEnem").innerText = tarefas.filter(t => t.categoria === "ENEM").length;

  if ($("percentualProgresso")) $("percentualProgresso").innerText = `${progresso}%`;
  if ($("barraProgresso")) $("barraProgresso").style.width = `${progresso}%`;
}

function renderTudo() {
  renderTarefas();
  renderNotas();
  renderResumo();
}

function perguntarIA() {
  const prompt = $("promptIA")?.value.trim();
  const resposta = $("respostaIA");

  if (!resposta) return;

  if (!prompt) {
    resposta.innerText = "Digite uma pergunta primeiro.";
    return;
  }

  resposta.innerText =
    "Área de IA preparada. Para funcionar com ChatGPT real, será necessário conectar um backend.\n\n" +
    "Pergunta enviada:\n" +
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

/* eventos principais */
document.addEventListener("DOMContentLoaded", function () {
  preencherMaterias();
  preencherFiltros();
  renderTudo();

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => mudarPagina(btn.dataset.page));
  });

  const modalTarefa = $("modalTarefa");
  if (modalTarefa) {
    modalTarefa.addEventListener("click", function (event) {
      if (event.target.id === "modalTarefa") {
        fecharModalTarefa();
      }
    });
  }

  const formTarefa = $("formTarefa");
  if (formTarefa) {
    formTarefa.addEventListener("submit", salvarTarefa);
  }

  const formNota = $("formNota");
  if (formNota) {
    formNota.addEventListener("submit", salvarNota);
  }
});

/* botões dinâmicos */
document.addEventListener("click", function (event) {
  const botao = event.target.closest("button[data-action]");
  if (!botao) return;

  const id = Number(botao.dataset.id);
  const action = botao.dataset.action;

  if (action === "status") alternarStatus(id);
  if (action === "editar") abrirModalTarefa(id);
  if (action === "excluir") excluirTarefa(id);
  if (action === "excluirNota") excluirNota(id);
});

/* funções globais usadas pelo HTML */
window.abrirModalTarefa = abrirModalTarefa;
window.fecharModalTarefa = fecharModalTarefa;
window.perguntarIA = perguntarIA;
window.renderTudo = renderTudo;