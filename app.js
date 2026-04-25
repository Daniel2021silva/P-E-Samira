import { auth, db } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (id) => document.getElementById(id);

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

let usuarioAtual = null;
let tarefas = [];
let notas = [];

function preencherMaterias() {
  ["tarefaMateria", "notaMateria", "filtroMateria"].forEach(id => {
    const select = $(id);
    if (!select) return;

    let html = "";

    if (id === "filtroMateria") {
      html += `<option value="">Matéria</option>`;
    }

    materias.forEach(m => {
      html += `<option value="${m}">${m}</option>`;
    });

    select.innerHTML = html;
  });
}

window.cadastrar = async function () {
  const email = $("email")?.value.trim();
  const senha = $("senha")?.value.trim();

  if (!email || !senha) {
    alert("Digite email e senha.");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    alert("Conta criada com sucesso.");
  } catch (erro) {
    alert("Erro ao criar conta: " + erro.message);
    console.error(erro);
  }
};

window.entrar = async function () {
  const email = $("email")?.value.trim();
  const senha = $("senha")?.value.trim();

  if (!email || !senha) {
    alert("Digite email e senha.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch (erro) {
    alert("Erro ao entrar: " + erro.message);
    console.error(erro);
  }
};

window.sair = async function () {
  await signOut(auth);
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    usuarioAtual = user.uid;

    if ($("loginBox")) $("loginBox").style.display = "none";
    if ($("appBox")) $("appBox").style.display = "block";

    await carregarTudo();
  } else {
    usuarioAtual = null;

    if ($("loginBox")) $("loginBox").style.display = "grid";
    if ($("appBox")) $("appBox").style.display = "none";
  }
});

window.mudarPagina = function (pagina) {
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

  if ($("pageTitle")) $("pageTitle").innerText = titulos[pagina] || "StudyFlow";
};

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => mudarPagina(btn.dataset.page));
});

window.abrirModalTarefa = function () {
  if ($("modalTarefa")) $("modalTarefa").classList.add("active");
};

window.fecharModalTarefa = function () {
  if ($("modalTarefa")) $("modalTarefa").classList.remove("active");
  if ($("formTarefa")) $("formTarefa").reset();
};

if ($("modalTarefa")) {
  $("modalTarefa").addEventListener("click", (e) => {
    if (e.target.id === "modalTarefa") fecharModalTarefa();
  });
}

if ($("formTarefa")) {
  $("formTarefa").addEventListener("submit", async (e) => {
    e.preventDefault();
    await salvarTarefa();
  });
}

window.salvarTarefa = async function () {
  if (!usuarioAtual) {
    alert("Faça login primeiro.");
    return;
  }

  const titulo = $("tarefaTitulo")?.value.trim();
  const materia = $("tarefaMateria")?.value || "";
  const categoria = $("tarefaCategoria")?.value || "Escola";
  const data = $("tarefaData")?.value || "";
  const tipo = $("tarefaTipo")?.value || "Tarefa";
  const status = $("tarefaStatus")?.value || "Pendente";
  const descricao = $("tarefaDescricao")?.value.trim() || "";

  if (!titulo || !data) {
    alert("Preencha título e data.");
    return;
  }

  try {
    await addDoc(collection(db, "usuarios", usuarioAtual, "tarefas"), {
      titulo,
      materia,
      categoria,
      data,
      tipo,
      status,
      descricao,
      criadoEm: new Date().toISOString()
    });

    fecharModalTarefa();
    await carregarTarefas();
  } catch (erro) {
    alert("Erro ao salvar tarefa: " + erro.message);
    console.error(erro);
  }
};

async function carregarTarefas() {
  tarefas = [];

  const snap = await getDocs(collection(db, "usuarios", usuarioAtual, "tarefas"));

  snap.forEach(docSnap => {
    tarefas.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderTudo();
}

window.excluirTarefa = async function (id) {
  if (!confirm("Excluir esta tarefa?")) return;

  try {
    await deleteDoc(doc(db, "usuarios", usuarioAtual, "tarefas", id));
    await carregarTarefas();
  } catch (erro) {
    alert("Erro ao excluir tarefa: " + erro.message);
    console.error(erro);
  }
};

if ($("formNota")) {
  $("formNota").addEventListener("submit", async (e) => {
    e.preventDefault();
    await salvarNota();
  });
}

async function salvarNota() {
  if (!usuarioAtual) {
    alert("Faça login primeiro.");
    return;
  }

  const titulo = $("notaTitulo")?.value.trim();
  const materia = $("notaMateria")?.value || "";
  const categoria = $("notaCategoria")?.value || "Escola";
  const texto = $("notaTexto")?.value.trim();

  if (!titulo || !texto) {
    alert("Preencha título e anotação.");
    return;
  }

  try {
    await addDoc(collection(db, "usuarios", usuarioAtual, "notas"), {
      titulo,
      materia,
      categoria,
      texto,
      criadoEm: new Date().toISOString(),
      data: new Date().toLocaleDateString("pt-BR")
    });

    $("formNota").reset();
    await carregarNotas();
  } catch (erro) {
    alert("Erro ao salvar anotação: " + erro.message);
    console.error(erro);
  }
}

async function carregarNotas() {
  notas = [];

  const snap = await getDocs(collection(db, "usuarios", usuarioAtual, "notas"));

  snap.forEach(docSnap => {
    notas.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderTudo();
}

window.excluirNota = async function (id) {
  if (!confirm("Excluir esta anotação?")) return;

  try {
    await deleteDoc(doc(db, "usuarios", usuarioAtual, "notas", id));
    await carregarNotas();
  } catch (erro) {
    alert("Erro ao excluir anotação: " + erro.message);
    console.error(erro);
  }
};

async function carregarTudo() {
  await carregarTarefas();
  await carregarNotas();
}

window.renderTudo = function () {
  renderTarefas();
  renderNotas();
  renderResumo();
};

function renderTarefas() {
  const lista = $("listaTarefas");
  const dash = $("listaDashboard");

  let filtradas = [...tarefas];

  const categoria = $("filtroCategoria")?.value || "";
  const status = $("filtroStatus")?.value || "";
  const materia = $("filtroMateria")?.value || "";
  const busca = $("buscaTarefa")?.value.toLowerCase() || "";

  if (categoria) filtradas = filtradas.filter(t => t.categoria === categoria);
  if (status) filtradas = filtradas.filter(t => t.status === status);
  if (materia) filtradas = filtradas.filter(t => t.materia === materia);

  if (busca) {
    filtradas = filtradas.filter(t =>
      (t.titulo || "").toLowerCase().includes(busca) ||
      (t.materia || "").toLowerCase().includes(busca)
    );
  }

  filtradas.sort((a, b) => new Date(a.data) - new Date(b.data));

  const html = filtradas.length
    ? filtradas.map(t => `
      <div class="item">
        <div>
          <h4>${limpar(t.titulo)}</h4>
          <p>${limpar(t.descricao || "Sem descrição")}</p>
          <div class="badges">
            <span class="badge">${limpar(t.materia)}</span>
            <span class="badge">${limpar(t.categoria)}</span>
            <span class="badge">${limpar(t.tipo)}</span>
            <span class="badge">${formatarData(t.data)}</span>
            <span class="badge">${limpar(t.status)}</span>
          </div>
        </div>
        <button class="delete" onclick="excluirTarefa('${t.id}')">Excluir</button>
      </div>
    `).join("")
    : `<div class="item">Nenhuma tarefa encontrada.</div>`;

  if (lista) lista.innerHTML = html;

  const proximas = tarefas
    .filter(t => t.status !== "Concluído")
    .slice(0, 5);

  if (dash) {
    dash.innerHTML = proximas.length
      ? proximas.map(t => `
        <div class="item">
          <h4>${limpar(t.titulo)}</h4>
          <p>${limpar(t.materia)} • ${formatarData(t.data)}</p>
        </div>
      `).join("")
      : `<div class="item">Nenhuma tarefa pendente.</div>`;
  }
}

function renderNotas() {
  const lista = $("listaNotas");
  if (!lista) return;

  lista.innerHTML = notas.length
    ? notas.map(n => `
      <div class="note">
        <h4>${limpar(n.titulo)}</h4>
        <div class="badges">
          <span class="badge">${limpar(n.materia)}</span>
          <span class="badge">${limpar(n.categoria)}</span>
          <span class="badge">${limpar(n.data || "")}</span>
        </div>
        <p>${limpar(n.texto)}</p>
        <button class="delete" onclick="excluirNota('${n.id}')">Excluir</button>
      </div>
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

window.perguntarIA = function () {
  const prompt = $("promptIA")?.value.trim();

  if (!prompt) {
    $("respostaIA").innerText = "Digite uma pergunta primeiro.";
    return;
  }

  $("respostaIA").innerText =
    "IA ainda não conectada ao backend.\n\nPergunta enviada:\n" + prompt;
};

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

preencherMaterias();