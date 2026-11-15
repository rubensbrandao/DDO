
const canvas = document.getElementById("office");
const ctx = canvas.getContext("2d");
const panel = document.getElementById("panelContent");
const sceneWrap = document.getElementById("sceneWrap");

const W = 960;
const H = 640;

let zoom = 1;
let hovered = null;
let hotspots = [];

const departments = [
  {
    name: "Gerência Geral",
    employee: "Cláudio",
    role: "Gerente geral",
    color: "#d5a66b",
    floor: "#a77c58",
    wall: "#596b78",
    description: "Coordenação geral da operação Dauns.",
    objects: [
      ["Computador", "Painel geral", "Acompanhe os indicadores e a situação de todos os departamentos."],
      ["Pasta", "Tarefas e pendências", "Consulte as atividades que precisam de atenção."],
      ["Arquivo", "Documentos e relatórios", "Acesse relatórios, documentos e históricos da operação."],
      ["Funcionário", "Conversar com Cláudio", "Converse com o gerente geral e solicite análises ou ações."]
    ]
  },
  {
    name: "Marketing",
    employee: "Lucas",
    role: "Marketing",
    color: "#6ca7c9",
    floor: "#8b705b",
    wall: "#496b7c",
    description: "Estratégias, campanhas e planejamento.",
    objects: [
      ["Computador", "Planejamento de marketing", "Organize estratégias e campanhas da Dauns."],
      ["Pasta", "Campanhas", "Consulte campanhas em andamento e ideias de divulgação."],
      ["Quadro", "Calendário", "Veja datas comemorativas e oportunidades."],
      ["Funcionário", "Conversar com Lucas", "Converse sobre estratégias, campanhas e resultados."]
    ]
  },
  {
    name: "Design e Criação",
    employee: "Designer",
    role: "Criação visual",
    color: "#bd8bd0",
    floor: "#90765e",
    wall: "#705c82",
    description: "Produção de materiais e identidade visual.",
    objects: [
      ["Computador", "Estúdio de criação", "Acesse os materiais gráficos e projetos visuais."],
      ["Mesa", "Área de criação", "Espaço de trabalho para desenvolver novas artes."],
      ["Arquivo", "Biblioteca de artes", "Consulte materiais, modelos e referências."],
      ["Funcionário", "Conversar com Designer", "Converse sobre peças gráficas e materiais."]
    ]
  },
  {
    name: "Redes Sociais",
    employee: "Social Media",
    role: "Publicações e canais",
    color: "#72b89a",
    floor: "#9b795b",
    wall: "#4c7668",
    description: "Gestão de canais e publicações.",
    objects: [
      ["Computador", "Central de publicações", "Organize e acompanhe as publicações."],
      ["Celular", "Redes sociais", "Acesse os canais sociais conectados."],
      ["Quadro", "Desempenho", "Acompanhe métricas e resultados das redes."],
      ["Funcionário", "Conversar com Social Media", "Converse sobre publicações e desempenho."]
    ]
  },
  {
    name: "Atendimento",
    employee: "Atendente",
    role: "Relacionamento",
    color: "#d6a56e",
    floor: "#9b7659",
    wall: "#77624d",
    description: "Atendimento e relacionamento com clientes.",
    objects: [
      ["Computador", "Central de atendimento", "Acompanhe conversas e solicitações."],
      ["Telefone", "WhatsApp", "Acesse a central de mensagens."],
      ["Arquivo", "Histórico de clientes", "Consulte registros e históricos de atendimento."],
      ["Funcionário", "Conversar com atendente", "Converse sobre atendimentos e solicitações."]
    ]
  },
  {
    name: "Inteligência e Relatórios",
    employee: "Analista",
    role: "Dados e inteligência",
    color: "#83a9d5",
    floor: "#8c795f",
    wall: "#526b88",
    description: "Análise de dados e indicadores.",
    objects: [
      ["Computador", "Painel de indicadores", "Consulte indicadores, vendas e comparativos."],
      ["Gráficos", "Resultados", "Visualize os resultados da operação."],
      ["Arquivo", "Base de informações", "Consulte pesquisas e históricos."],
      ["Funcionário", "Conversar com analista", "Converse sobre análises e oportunidades."]
    ]
  }
];

const roomPositions = [
  [12, 12], [332, 12], [652, 12],
  [12, 328], [332, 328], [652, 328]
];

function rect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function pixelText(text, x, y, size = 9, color = "#fff") {
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px monospace`;
  ctx.fillText(text, x, y);
}

function drawFloor(x, y, d) {
  // Piso em perspectiva isométrica simplificada
  ctx.fillStyle = d.floor;
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 65);
  ctx.lineTo(x + 292, y + 65);
  ctx.lineTo(x + 305, y + 260);
  ctx.lineTo(x, y + 260);
  ctx.closePath();
  ctx.fill();

  // Linhas de piso
  ctx.strokeStyle = "rgba(30,25,20,.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 105 + i * 32);
    ctx.lineTo(x + 296, y + 105 + i * 32);
    ctx.stroke();
  }
}

function drawWalls(x, y, d) {
  rect(x + 10, y + 10, 282, 65, d.wall);
  rect(x + 10, y + 10, 8, 55, "#273743");
  rect(x + 284, y + 10, 8, 55, "#273743");

  // Faixa superior
  rect(x + 10, y + 10, 282, 7, "#d6c7a4");
  rect(x + 18, y + 66, 266, 5, "rgba(0,0,0,.2)");

  // Janela
  rect(x + 205, y + 25, 55, 30, "#243d50");
  rect(x + 210, y + 29, 45, 22, "#9ac8cf");
  rect(x + 231, y + 29, 3, 22, "#526b78");
  rect(x + 210, y + 39, 45, 2, "#526b78");
}

function drawDesk(x, y, color) {
  // Mesa
  rect(x, y, 75, 8, "#49352b");
  rect(x + 5, y + 8, 5, 23, "#382b25");
  rect(x + 65, y + 8, 5, 23, "#382b25");
  rect(x + 7, y - 4, 62, 5, color);

  // Monitor
  rect(x + 23, y - 25, 30, 19, "#202c35");
  rect(x + 26, y - 22, 24, 13, "#70b6b1");
  rect(x + 36, y - 6, 5, 6, "#29333b");
  rect(x + 31, y, 15, 3, "#29333b");

  // Teclado
  rect(x + 15, y + 3, 22, 3, "#d0d0c3");
}

function drawFilingCabinet(x, y) {
  rect(x, y, 35, 48, "#59636b");
  rect(x + 3, y + 4, 29, 12, "#89959b");
  rect(x + 3, y + 19, 29, 12, "#89959b");
  rect(x + 3, y + 34, 29, 10, "#89959b");
  rect(x + 15, y + 9, 5, 2, "#34404a");
  rect(x + 15, y + 24, 5, 2, "#34404a");
  rect(x + 15, y + 38, 5, 2, "#34404a");
}

function drawFolder(x, y) {
  rect(x, y + 4, 25, 17, "#e6bd5b");
  rect(x + 2, y, 10, 5, "#f0d47c");
  rect(x + 4, y + 8, 17, 2, "#b58b3f");
}

function drawBoard(x, y, color) {
  rect(x, y, 57, 35, "#453a32");
  rect(x + 3, y + 3, 51, 29, "#e4dfc6");
  rect(x + 8, y + 9, 18, 3, color);
  rect(x + 8, y + 16, 35, 2, "#89928b");
  rect(x + 8, y + 23, 26, 2, "#89928b");
}

function drawPhone(x, y) {
  rect(x, y, 12, 22, "#242b34");
  rect(x + 2, y + 3, 8, 14, "#7fc7bb");
  rect(x + 5, y + 19, 3, 1, "#eee");
}

function drawPerson(x, y, d) {
  // Sombra
  rect(x - 8, y + 30, 24, 5, "rgba(0,0,0,.22)");

  // Pernas
  rect(x - 5, y + 19, 7, 13, "#263b55");
  rect(x + 4, y + 19, 7, 13, "#263b55");
  rect(x - 7, y + 29, 9, 4, "#29252a");
  rect(x + 4, y + 29, 9, 4, "#29252a");

  // Corpo
  rect(x - 8, y + 5, 24, 17, d.color);
  rect(x - 11, y + 8, 4, 12, d.color);
  rect(x + 16, y + 8, 4, 12, d.color);

  // Cabeça
  rect(x - 5, y - 9, 17, 15, "#e7b78c");
  rect(x - 6, y - 12, 19, 6, "#49352d");
  rect(x - 2, y - 1, 3, 3, "#3b302c");
  rect(x + 7, y - 1, 3, 3, "#3b302c");
}

function addHotspot(x, y, w, h, dept, object, title, description) {
  hotspots.push({
    x, y, w, h,
    dept,
    object,
    title,
    description
  });
}

function drawRoom(index) {
  const d = departments[index];
  const [x, y] = roomPositions[index];

  // Sombra e base
  rect(x + 5, y + 258, 300, 7, "rgba(0,0,0,.25)");

  // Parede e piso
  drawFloor(x, y, d);
  drawWalls(x, y, d);

  // Placa do departamento
  rect(x + 25, y + 24, 135, 25, "#25313c");
  pixelText(d.name.toUpperCase(), x + 32, y + 40, 9, "#f4f0dc");

  // Computador / mesa
  drawDesk(x + 48, y + 150, d.color);
  addHotspot(x + 65, y + 118, 72, 55, d.name, "Computador",
    d.objects[0][1], d.objects[0][2]);

  // Arquivo
  drawFilingCabinet(x + 244, y + 90);
  addHotspot(x + 240, y + 88, 43, 53, d.name, "Arquivo",
    d.objects[2][1], d.objects[2][2]);

  // Pasta sobre a mesa
  drawFolder(x + 140, y + 157);
  addHotspot(x + 135, y + 150, 37, 32, d.name, "Pasta",
    d.objects[1][1], d.objects[1][2]);

  // Elemento especial de cada departamento
  if (index === 3) {
    drawPhone(x + 185, y + 153);
    addHotspot(x + 180, y + 145, 25, 36, d.name, "Celular",
      "Redes sociais", "Acesse os canais sociais conectados.");
  } else if (index === 4) {
    drawPhone(x + 185, y + 153);
    addHotspot(x + 180, y + 145, 25, 36, d.name, "Telefone",
      "WhatsApp", "Acesse a central de mensagens.");
  } else {
    drawBoard(x + 180, y + 85, d.color);
    addHotspot(x + 177, y + 82, 65, 43, d.name, "Quadro",
      d.objects[2][1], d.objects[2][2]);
  }

  // Funcionário
  drawPerson(x + 190, y + 192, d);
  pixelText(d.employee, x + 165, y + 237, 9, "#fff");
  addHotspot(x + 170, y + 175, 45, 65, d.name, "Funcionário",
    d.objects[3][1], d.objects[3][2]);

  // Borda da sala
  ctx.strokeStyle = "#d3c3a2";
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 8, y + 8, 286, 253);

  // Destaque da sala
  if (hovered && hovered.dept === d.name) {
    ctx.strokeStyle = "#9bf0c0";
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 5, y + 5, 292, 259);
  }

  // Identificação
  rect(x + 12, y + 267, 285, 27, "#202b35");
  pixelText(`${index + 1}. ${d.name}`, x + 22, y + 284, 11, "#e8eee9");
}

function drawScene() {
  ctx.clearRect(0, 0, W, H);
  hotspots = [];

  // Fundo
  rect(0, 0, W, H, "#27343a");

  // Piso geral
  for (let y = 0; y < H; y += 24) {
    for (let x = 0; x < W; x += 24) {
      if ((x / 24 + y / 24) % 2 === 0) {
        rect(x, y, 24, 24, "rgba(255,255,255,.018)");
      }
    }
  }

  departments.forEach((_, i) => drawRoom(i));

  // Tooltip do objeto em foco
  if (hovered) {
    const label = hovered.object;
    const tw = Math.max(75, label.length * 7 + 18);
    const tx = Math.min(hovered.x, W - tw - 8);
    const ty = Math.max(hovered.y - 24, 5);

    rect(tx, ty, tw, 19, "#14251f");
    ctx.strokeStyle = "#8ee5b7";
    ctx.lineWidth = 1;
    ctx.strokeRect(tx, ty, tw, 19);
    pixelText(label, tx + 8, ty + 13, 9, "#b8f3d0");
  }
}

function openObject(item) {
  const d = departments.find(dep => dep.name === item.dept);

  panel.innerHTML = `
    <span class="panel-tag">${item.dept.toUpperCase()}</span>
    <h2>${item.title}</h2>
    <p>${item.description}</p>
    <div class="info-row">
      <span>Departamento</span>
      <strong>${item.dept}</strong>
    </div>
    <div class="info-row">
      <span>Objeto</span>
      <strong>${item.object}</strong>
    </div>
    <button class="panel-action" id="panelAction">
      Abrir ${item.object.toLowerCase()}
    </button>
    <div class="tip">
      <strong>Protótipo DDO</strong>
      Esta área será conectada às ferramentas e aos dados reais do departamento.
    </div>
  `;

  document.getElementById("panelAction").addEventListener("click", () => {
    panel.innerHTML = `
      <span class="panel-tag">${item.dept.toUpperCase()}</span>
      <h2>${item.title}</h2>
      <p>Você abriu esta área do protótipo.</p>
      <div class="tip">
        <strong>Próxima etapa</strong>
        Aqui será implementada a ferramenta real: dados, documentos, tarefas ou conversa com o funcionário.
      </div>
      <button class="panel-action" id="backAction">Voltar</button>
    `;
    document.getElementById("backAction").addEventListener("click", () => openObject(item));
  });
}

function openEmployee(item) {
  const d = departments.find(dep => dep.name === item.dept);

  panel.innerHTML = `
    <span class="panel-tag">${d.role.toUpperCase()}</span>
    <h2>${d.employee}</h2>
    <p>Olá! Sou ${d.employee}, responsável por ${d.name.toLowerCase()}.</p>
    <div class="tip">
      <strong>Conversa demonstrativa</strong>
      Em uma próxima etapa, este espaço será conectado ao assistente de IA do funcionário.
    </div>
    <button class="panel-action" id="talkButton">Iniciar conversa</button>
  `;

  document.getElementById("talkButton").addEventListener("click", () => {
    panel.innerHTML = `
      <span class="panel-tag">CONVERSA</span>
      <h2>${d.employee}</h2>
      <p>Este é o espaço de conversa com o funcionário virtual.</p>
      <div class="tip">
        <strong>${d.employee}</strong>
        Olá! Como posso ajudar com ${d.name.toLowerCase()}?
      </div>
      <p>A integração com IA será adicionada posteriormente.</p>
    `;
  });
}

function pointerPosition(event) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - r.left) * W / r.width,
    y: (event.clientY - r.top) * H / r.height
  };
}

canvas.addEventListener("mousemove", event => {
  const p = pointerPosition(event);

  hovered = [...hotspots].reverse().find(h =>
    p.x >= h.x && p.x <= h.x + h.w &&
    p.y >= h.y && p.y <= h.y + h.h
  ) || null;

  canvas.style.cursor = hovered ? "pointer" : "default";
  drawScene();
});

canvas.addEventListener("mouseleave", () => {
  hovered = null;
  drawScene();
});

canvas.addEventListener("click", event => {
  const p = pointerPosition(event);

  const item = [...hotspots].reverse().find(h =>
    p.x >= h.x && p.x <= h.x + h.w &&
    p.y >= h.y && p.y <= h.y + h.h
  );

  if (!item) return;

  if (item.object === "Funcionário") {
    openEmployee(item);
  } else {
    openObject(item);
  }
});

document.getElementById("zoomIn").addEventListener("click", () => {
  zoom = Math.min(zoom + 0.1, 1.5);
  canvas.style.width = `${zoom * 100}%`;
});

document.getElementById("zoomOut").addEventListener("click", () => {
  zoom = Math.max(zoom - 0.1, 0.7);
  canvas.style.width = `${zoom * 100}%`;
});

document.getElementById("closePanel").addEventListener("click", () => {
  panel.innerHTML = `
    <div class="welcome-icon">⌖</div>
    <h2>Bem-vindo ao DDO</h2>
    <p>Escolha um ambiente ou clique em um objeto para começar.</p>
  `;
});

drawScene();
