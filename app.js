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

let tarefas = [];
let notas = [];

let firebaseAtivo = false;
let FB = null;

const $ = (id) => document.getElementById(id);

/* =========================
   LOCAL STORAGE
========================= */

function carregarLocal() {
  try {
    tarefas = JSON.parse(localStorage.getItem(STORAGE_TAREFAS)) || [];
    notas = JSON.parse(localStorage.getItem(STORAGE_NOTAS)) || [];
  } catch (erro) {
    console.warn("Erro ao carregar localStorage:", erro);
    tarefas = [];
    notas = [];
  }
}

function salvarLocal() {
  try {
    localStorage.setItem(STORAGE_TAREFAS, JSON.stringify(tarefas));
    localStorage.setItem(STORAGE_NOTAS, JSON.stringify(notas));
  } catch (erro) {
    console.warn("Erro ao salvar localStorage:", erro);
  }
}

/* =========================
   FIREBASE REALTIME DATABASE
========================= */

async function iniciarFirebase() {
  try {
    FB = await import("./firebase.js");
    firebaseAtivo = !!FB.db;

    if (firebaseAtivo) {
      console.log("Firebase Realtime Database conectado.");
    }
  } catch (erro) {
    firebaseAtivo = false;
    console.warn("Firebase não conectado. O app continuará usando localStorage.", erro);
  }
}

async function carregarFirebase() {
  if (!firebaseAtivo) return false;

  try {
    const snapTarefas = await FB.get(FB.ref(FB.db, "tarefas"));
    const snapNotas = await FB.get(FB.ref(FB.db, "notas"));

    tarefas = snapTarefas.exists()
      ? Object.values(snapTarefas.val())
      : tarefas;

    notas = snapNotas.exists()
      ? Object.values(snapNotas.val())
      : notas;

    tarefas = Array.isArray(tarefas) ? tarefas : [];
    notas = Array.isArray(notas) ? notas : [];

    salvarLocal();
    return true;
  } catch (erro) {
    console.warn("Erro ao carregar dados do Firebase. Usando localStorage.", erro);
    return false;
  }
}

async function salvarTarefaNuvem(tarefa) {
  salvarLocal();

  if (!firebaseAtivo) return;

  try {
    await FB.set(FB.ref(FB.db, `tarefas/${String(tarefa.id)}`), tarefa);
  } catch (erro) {
    console.warn("Não foi possível salvar tarefa no Firebase.", erro);
  }
}

async function salvarNotaNuvem(nota) {
  salvarLocal();

  if (!firebaseAtivo) return;

  try {
    await FB.set(FB.ref(FB.db, `notas/${String(nota.id)}`), nota);
  } catch (erro) {
    console.warn("Não foi possível salvar anotação no Firebase.", erro);
  }
}

async function excluirTarefaNuvem(id) {
  salvarLocal();

  if (!firebaseAtivo) return;

  try {
    await FB.remove(FB.ref(FB.db, `tarefas/${String(id)}`));
  } catch (erro) {
    console.warn("Não foi possível excluir tarefa no Firebase.", erro);
  }
}

async function excluirNotaNuvem(id) {
  salvarLocal();

  if (!firebaseAtivo) return;

  try {
    await FB.remove(FB.ref(FB.db, `notas/${String(id)}`));
  } catch (erro) {
    console.warn("Não foi possível excluir anotação no Firebase.", erro);
  }
}

/* =========================
   CONFIGURAÇÃO INICIAL
========================= */

function preencherMaterias() {
  ["tarefaMateria", "filtroMateria"].forEach(id => {
    const select = $(id);
    if (!select) return;

    let html = id === "filtroMateria"
      ? `<option value="">Todas as matérias</option>`
      : "";

    materias.forEach(materia => {
      html += `<option value="${limpar(materia)}">${limpar(materia)}</option>`;
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

/* =========================
   NAVEGAÇÃO
========================= */

function mudarPagina(pagina) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.remove("active");
  });

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

/* =========================
   MODAL DE TAREFA
========================= */

function abrirModalTarefa(id = null) {
  const modal = $("modalTarefa");
  const form = $("formTarefa");

  if (!modal || !form) return;

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");

  if (id) {
    const tarefa = tarefas.find(t => String(t.id) === String(id));
    if (!tarefa) return;

    $("modalTarefaTitle").innerText = "Editar tarefa";
    $("tarefaId").value = tarefa.id;
    $("tarefaTitulo").value = tarefa.titulo || "";
    $("tarefaMateria").value = tarefa.materia || "";
    $("tarefaCategoria").value = tarefa.categoria || "Escola";
    $("tarefaTipo").value = tarefa.tipo || "Tarefa";
    $("tarefaStatus").value = tarefa.status || "Pendente";
    $("tarefaData").value = tarefa.data || "";
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

  if (modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }

  if ($("formTarefa")) {
    $("formTarefa").reset();
  }
}

/* =========================
   AÇÕES DE TAREFAS
========================= */

async function alternarStatus(id) {
  tarefas = tarefas.map(tarefa => {
    if (String(tarefa.id) !== String(id)) return tarefa;

    let novoStatus = "Pendente";

    if (tarefa.status === "Pendente") {
      novoStatus = "Fazendo";
    } else if (tarefa.status === "Fazendo") {
      novoStatus = "Concluído";
    } else if (tarefa.status === "Concluído") {
      novoStatus = "Pendente";
    }

    return {
      ...tarefa,
      status: novoStatus,
      atualizadoEm: new Date().toISOString()
    };
  });

  const tarefaAtualizada = tarefas.find(t => String(t.id) === String(id));

  if (tarefaAtualizada) {
    await salvarTarefaNuvem(tarefaAtualizada);
  }

  renderTudo();
}

async function excluirTarefa(id) {
  if (!confirm("Deseja excluir esta tarefa?")) return;

  tarefas = tarefas.filter(tarefa => String(tarefa.id) !== String(id));

  salvarLocal();
  await excluirTarefaNuvem(id);
  renderTudo();
}

/* =========================
   AÇÕES DE ANOTAÇÕES
========================= */

async function excluirNota(id) {
  if (!confirm("Deseja excluir esta anotação?")) return;

  notas = notas.filter(nota => String(nota.id) !== String(id));

  salvarLocal();
  await excluirNotaNuvem(id);
  renderTudo();
}

/* =========================
   RENDERIZAÇÃO DE TAREFAS
========================= */

function renderTarefas() {
  const listaTarefas = $("listaTarefas");
  const listaDashboard = $("listaDashboard");

  let lista = [...tarefas];

  const categoria = $("filtroCategoria")?.value || "";
  const status = $("filtroStatus")?.value || "";
  const materia = $("filtroMateria")?.value || "";
  const busca = $("buscaTarefa")?.value.toLowerCase() || "";

  if (categoria) {
    lista = lista.filter(tarefa => tarefa.categoria === categoria);
  }

  if (status) {
    lista = lista.filter(tarefa => tarefa.status === status);
  }

  if (materia) {
    lista = lista.filter(tarefa => tarefa.materia === materia);
  }

  if (busca) {
    lista = lista.filter(tarefa =>
      String(tarefa.titulo || "").toLowerCase().includes(busca) ||
      String(tarefa.materia || "").toLowerCase().includes(busca) ||
      String(tarefa.categoria || "").toLowerCase().includes(busca) ||
      String(tarefa.descricao || "").toLowerCase().includes(busca)
    );
  }

  lista.sort((a, b) => new Date(a.data || "2999-12-31") - new Date(b.data || "2999-12-31"));

  if (listaTarefas) {
    listaTarefas.innerHTML = lista.length
      ? lista.map(cardTarefa).join("")
      : `<div class="item">Nenhuma tarefa encontrada.</div>`;
  }

  const proximas = tarefas
    .filter(tarefa => tarefa.status !== "Concluído")
    .sort((a, b) => new Date(a.data || "2999-12-31") - new Date(b.data || "2999-12-31"))
    .slice(0, 5);

  if (listaDashboard) {
    listaDashboard.innerHTML = proximas.length
      ? proximas.map(cardTarefa).join("")
      : `<div class="item">Nenhuma tarefa pendente.</div>`;
  }
}

function cardTarefa(tarefa) {
  const idJs = JSON.stringify(String(tarefa.id));

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
        <button type="button" class="done" onclick="alternarStatus(${idJs})">Status</button>
        <button type="button" class="edit" onclick="abrirModalTarefa(${idJs})">Editar</button>
        <button type="button" class="delete" onclick="excluirTarefa(${idJs})">Excluir</button>
      </div>
    </article>
  `;
}

/* =========================
   RENDERIZAÇÃO DE ANOTAÇÕES
========================= */

function renderNotas() {
  const listaNotas = $("listaNotas");
  if (!listaNotas) return;

  notas.sort((a, b) => new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0));

  listaNotas.innerHTML = notas.length
    ? notas.map(nota => {
      const idJs = JSON.stringify(String(nota.id));

      return `
        <article class="note">
          <h4>${limpar(nota.titulo)}</h4>

          <div class="badges">
            <span class="badge">${limpar(nota.data)}</span>
          </div>

          <p>${limpar(nota.texto)}</p>

          <button type="button" class="delete" onclick="excluirNota(${idJs})">
            Excluir
          </button>
        </article>
      `;
    }).join("")
    : `<div class="item">Nenhuma anotação salva.</div>`;
}

/* =========================
   RESUMO E DESEMPENHO
========================= */

function renderResumo() {
  const hoje = dataHojeLocal();

  const pendentes = tarefas.filter(tarefa => tarefa.status !== "Concluído").length;
  const concluidas = tarefas.filter(tarefa => tarefa.status === "Concluído").length;
  const total = tarefas.length;
  const progresso = total ? Math.round((concluidas / total) * 100) : 0;

  if ($("totalPendentes")) {
    $("totalPendentes").innerText = pendentes;
  }

  if ($("totalAnotacoes")) {
    $("totalAnotacoes").innerText = notas.length;
  }

  if ($("tarefasHoje")) {
    $("tarefasHoje").innerText = tarefas.filter(tarefa => tarefa.data === hoje).length;
  }

  if ($("totalConcluidas")) {
    $("totalConcluidas").innerText = concluidas;
  }

  if ($("totalEscola")) {
    $("totalEscola").innerText = tarefas.filter(tarefa => tarefa.categoria === "Escola").length;
  }

  if ($("totalPave")) {
    $("totalPave").innerText = tarefas.filter(tarefa => tarefa.categoria === "PAVE").length;
  }

  if ($("totalEnem")) {
    $("totalEnem").innerText = tarefas.filter(tarefa => tarefa.categoria === "ENEM").length;
  }

  if ($("percentualProgresso")) {
    $("percentualProgresso").innerText = `${progresso}%`;
  }

  if ($("barraProgresso")) {
    $("barraProgresso").style.width = `${progresso}%`;
  }
}

function renderTudo() {
  renderTarefas();
  renderNotas();
  renderResumo();
}

/* =========================
   ASSISTENTE IA SIMPLES
========================= */

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

/* =========================
   EVENTOS
========================= */

function configurarEventos() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      mudarPagina(btn.dataset.page);
    });
  });

  if ($("modalTarefa")) {
    $("modalTarefa").addEventListener("click", (event) => {
      if (event.target.id === "modalTarefa") {
        fecharModalTarefa();
      }
    });
  }

  if ($("formTarefa")) {
    $("formTarefa").addEventListener("submit", async (event) => {
      event.preventDefault();

      const idAtual = $("tarefaId").value;

      const tarefaAntiga = tarefas.find(t => String(t.id) === String(idAtual));

      const tarefa = {
        id: idAtual ? String(idAtual) : String(Date.now()),
        titulo: $("tarefaTitulo").value.trim(),
        materia: $("tarefaMateria").value,
        categoria: $("tarefaCategoria").value,
        tipo: $("tarefaTipo").value,
        status: $("tarefaStatus").value,
        data: $("tarefaData").value,
        descricao: $("tarefaDescricao").value.trim(),
        criadoEm: tarefaAntiga?.criadoEm || new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      };

      if (!tarefa.titulo || !tarefa.data) {
        alert("Preencha o título e a data da tarefa.");
        return;
      }

      if (idAtual) {
        tarefas = tarefas.map(item =>
          String(item.id) === String(idAtual) ? tarefa : item
        );
      } else {
        tarefas.push(tarefa);
      }

      salvarLocal();
      await salvarTarefaNuvem(tarefa);

      fecharModalTarefa();
      renderTudo();
    });
  }

  if ($("formNota")) {
    $("formNota").addEventListener("submit", async (event) => {
      event.preventDefault();

      const titulo = $("notaTitulo").value.trim();
      const texto = $("notaTexto").value.trim();

      if (!titulo || !texto) {
        alert("Preencha o título e a anotação.");
        return;
      }

      const nota = {
        id: String(Date.now()),
        titulo,
        texto,
        data: new Date().toLocaleDateString("pt-BR"),
        criadoEm: new Date().toISOString()
      };

      notas.unshift(nota);

      salvarLocal();
      await salvarNotaNuvem(nota);

      $("formNota").reset();
      renderTudo();
    });
  }

  ["filtroCategoria", "filtroStatus", "filtroMateria"].forEach(id => {
    const campo = $(id);

    if (campo) {
      campo.addEventListener("change", renderTarefas);
    }
  });

  if ($("buscaTarefa")) {
    $("buscaTarefa").addEventListener("input", renderTarefas);
  }
}

/* =========================
   FUNÇÕES AUXILIARES
========================= */

function classeStatus(status) {
  if (status === "Concluído") return "badge ok";
  if (status === "Fazendo") return "badge warn";
  return "badge";
}

function formatarData(data) {
  if (!data) return "";

  const partes = String(data).split("-");
  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function dataHojeLocal() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function limpar(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   INICIALIZAÇÃO DO APP
========================= */

async function iniciarApp() {
  carregarLocal();

  preencherMaterias();
  preencherFiltros();
  configurarEventos();

  renderTudo();

  await iniciarFirebase();
  await carregarFirebase();

  renderTudo();
}

/*
  Como o app.js agora roda como type="module",
  as funções chamadas pelo onclick do HTML precisam ficar no window.
*/

window.abrirModalTarefa = abrirModalTarefa;
window.fecharModalTarefa = fecharModalTarefa;
window.alternarStatus = alternarStatus;
window.excluirTarefa = excluirTarefa;
window.excluirNota = excluirNota;
window.perguntarIA = perguntarIA;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarApp);
} else {
  iniciarApp();
}