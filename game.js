
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const world = { width: 1500, height: 1000 };

let camera = { x: 0, y: 0, zoom: 1 };
let paused = false;
let selected = null;
let tick = 0;

const buildings = [
    {
        name: "DAUNS",
        x: 590, y: 320,
        w: 250, h: 180,
        color: "#e9b65e",
        roof: "#b85d48",
        type: "Restaurante"
    },
    {
        name: "MERCADO",
        x: 1000, y: 170,
        w: 260, h: 190,
        color: "#d8d9a0",
        roof: "#668c72",
        type: "Supermercado"
    },
    {
        name: "ESCRITÓRIO DDO",
        x: 170, y: 170,
        w: 270, h: 190,
        color: "#b8c9d9",
        roof: "#647c9b",
        type: "Escritório"
    },
    {
        name: "CAFÉ",
        x: 1030, y: 620,
        w: 210, h: 155,
        color: "#d6a68d",
        roof: "#946b55",
        type: "Comércio"
    }
];

const names = [
    "Mauro", "Ana", "Rafael", "Bia",
    "João", "Lia", "Caio", "Nina",
    "Pedro", "Luna", "Davi", "Cris",
    "Ivo", "Mila", "Theo", "Lara"
];

const orders = [
    "Pedi três pastéis de frango e duas Coca-Colas. Estava uma delícia!",
    "Passei rapidinho e comprei dois pastéis de queijo.",
    "O pastel estava quentinho. Gostei bastante!",
    "Hoje escolhi um lanche em vez de pastel.",
    "Almocei por aqui. A comida estava boa."
];

const people = names.map((name, i) => {
    const x = 430 + Math.random() * 580;
    const y = 500 + Math.random() * 300;

    return {
        id: i,
        name,
        x, y,
        tx: x,
        ty: y,
        speed: 0.4 + Math.random() * 0.5,
        shirt: ["#d96c5f", "#547b9b", "#e2b64f", "#6f9872"][i % 4],
        skin: ["#e8b98e", "#9d6748", "#f0c9a2"][i % 3],
        hair: ["#4a3028", "#29252a", "#79533b"][i % 3],
        customer: i % 4 !== 0,
        order: orders[i % orders.length]
    };
});

function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();

    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;

    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    if (!camera.initialized) {
        camera.x = (rect.width - world.width) / 2;
        camera.y = (rect.height - world.height) / 2;
        camera.initialized = true;
    }

    draw();
}

window.addEventListener("resize", resize);

function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function drawTree(x, y) {
    rect(x - 5, y + 12, 10, 17, "#76543b");
    rect(x - 16, y - 4, 32, 22, "#397b54");
    rect(x - 11, y - 13, 22, 15, "#4c9462");
    rect(x - 3, y - 17, 7, 7, "#68a875");
}

function drawBuilding(b) {
    rect(b.x + 8, b.y + 10, b.w, b.h, "#00000022");
    rect(b.x, b.y, b.w, b.h, b.color);
    rect(b.x - 7, b.y - 14, b.w + 14, 30, b.roof);

    for (let i = 0; i < Math.floor(b.w / 62); i++) {
        rect(b.x + 18 + i * 62, b.y + 38, 39, 34, "#86b7c3");
        rect(b.x + 35 + i * 62, b.y + 38, 4, 34, "#e9e5d5");
    }

    rect(b.x + b.w / 2 - 19, b.y + b.h - 55, 38, 55, "#765747");

    rect(b.x + 18, b.y + b.h - 92, b.w - 36, 19, b.roof);

    ctx.fillStyle = "#283449";
    ctx.font = "bold 15px monospace";
    ctx.textAlign = "center";
    ctx.fillText(b.name, b.x + b.w / 2, b.y + b.h + 25);
}

function drawPerson(p) {
    const x = Math.round(p.x);
    const y = Math.round(p.y + Math.sin(tick * 0.08 + p.id) * 2);

    rect(x - 8, y + 15, 17, 4, "#263c3444");

    // Pernas
    rect(x - 6, y + 6, 5, 10, "#34465b");
    rect(x + 2, y + 6, 5, 10, "#34465b");

    // Corpo
    rect(x - 8, y - 7, 17, 15, p.shirt);
    rect(x - 10, y - 4, 3, 9, p.skin);
    rect(x + 9, y - 4, 3, 9, p.skin);

    // Cabeça
    rect(x - 6, y - 19, 13, 13, p.skin);
    rect(x - 7, y - 21, 14, 5, p.hair);
    rect(x - 7, y - 17, 3, 5, p.hair);
    rect(x + 2, y - 13, 2, 2, "#273044");

    if (selected && selected.id === p.id) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 13, y - 25, 27, 45);
    }
}

function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    ctx.save();

    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    // Terreno
    rect(0, 0, world.width, world.height, "#91b99a");

    // Ruas
    rect(0, 390, world.width, 160, "#777e7c");
    rect(500, 0, 100, world.height, "#777e7c");

    // Faixas
    for (let x = 20; x < world.width; x += 95) {
        rect(x, 466, 48, 5, "#e8dfb8");
    }

    for (let y = 20; y < world.height; y += 95) {
        rect(545, y, 5, 45, "#e8dfb8");
    }

    // Calçadas
    rect(0, 365, world.width, 25, "#c9c1a9");
    rect(0, 550, world.width, 25, "#c9c1a9");

    // Árvores
    [
        [80, 300], [460, 300], [920, 300],
        [1320, 330], [300, 650], [920, 850]
    ].forEach(p => drawTree(...p));

    // Prédios
    buildings.forEach(drawBuilding);

    // Pessoas
    people.forEach(drawPerson);

    ctx.restore();
}

function newDestination(p) {
    const b = buildings[Math.floor(Math.random() * buildings.length)];

    if (Math.random() < 0.4) {
        p.tx = b.x + b.w / 2;
        p.ty = b.y + b.h + 25;
    } else {
        p.tx = 100 + Math.random() * 1250;
        p.ty = 580 + Math.random() * 330;
    }
}

function updatePeople() {
    people.forEach(p => {
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 3) {
            newDestination(p);
        } else {
            p.x += dx / distance * p.speed;
            p.y += dy / distance * p.speed;
        }
    });
}

function worldPosition(e) {
    const r = canvas.getBoundingClientRect();

    return {
        x: (e.clientX - r.left - camera.x) / camera.zoom,
        y: (e.clientY - r.top - camera.y) / camera.zoom
    };
}

function showPerson(p) {
    document.getElementById("sideTitle").textContent = p.name;

    document.getElementById("sideSub").textContent =
        p.customer ? "Cliente fictício" : "Visitante fictício";

    document.getElementById("details").innerHTML = `
        <h3>${p.customer ? "Cliente da Dauns" : "Visitante da cidade"}</h3>
        <p><b>Pedido:</b> ${p.customer ? p.order : "Nenhum pedido associado."}</p>
        <p>“${p.customer ? p.order : "Estou passeando pela cidade!"}”</p>
        <button onclick="alert('Conversa demonstrativa com ${p.name}')">
            Conversar
        </button>
    `;
}

function showBuilding(b) {
    document.getElementById("sideTitle").textContent = b.name;
    document.getElementById("sideSub").textContent = b.type;

    document.getElementById("details").innerHTML = `
        <h3>${b.name}</h3>
        <p>${b.id === "dauns"
            ? "200 pastéis vendidos hoje (demonstração)."
            : "Estabelecimento da cidade virtual."}</p>
        <button onclick="alert('Abrindo painel de ${b.name}')">
            Entrar no estabelecimento
        </button>
    `;
}

function selectAt(pos) {
    for (const p of people) {
        if (Math.abs(pos.x - p.x) < 17 &&
            Math.abs(pos.y - (p.y - 5)) < 25) {
            selected = p;
            showPerson(p);
            return;
        }
    }

    for (const b of buildings) {
        if (pos.x >= b.x - 8 &&
            pos.x <= b.x + b.w + 8 &&
            pos.y >= b.y - 20 &&
            pos.y <= b.y + b.h + 40) {
            selected = b;
            showBuilding(b);
            return;
        }
    }

    selected = null;
    document.getElementById("sideTitle").textContent = "Visão da cidade";
    document.getElementById("sideSub").textContent = "Explore a cidade virtual.";
}

let dragging = null;

canvas.addEventListener("pointerdown", e => {
    canvas.setPointerCapture(e.pointerId);

    dragging = {
        x: e.clientX,
        y: e.clientY,
        cx: camera.x,
        cy: camera.y,
        moved: false
    };
});

canvas.addEventListener("pointermove", e => {
    if (!dragging) return;

    const dx = e.clientX - dragging.x;
    const dy = e.clientY - dragging.y;

    if (Math.abs(dx) + Math.abs(dy) > 4) {
        dragging.moved = true;
    }

    camera.x = dragging.cx + dx;
    camera.y = dragging.cy + dy;

    draw();
});

canvas.addEventListener("pointerup", e => {
    if (!dragging) return;

    if (!dragging.moved) {
        selectAt(worldPosition(e));
    }

    dragging = null;
});

function zoom(factor) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const cx = width / 2;
    const cy = height / 2;

    const wx = (cx - camera.x) / camera.zoom;
    const wy = (cy - camera.y) / camera.zoom;

    camera.zoom = Math.max(0.45, Math.min(2.5, camera.zoom * factor));

    camera.x = cx - wx * camera.zoom;
    camera.y = cy - wy * camera.zoom;

    draw();
}

canvas.addEventListener("wheel", e => {
    e.preventDefault();
    zoom(e.deltaY < 0 ? 1.12 : 0.89);
}, { passive: false });

document.getElementById("zoomIn").onclick = () => zoom(1.2);
document.getElementById("zoomOut").onclick = () => zoom(0.83);

document.getElementById("home").onclick = () => {
    camera.zoom = 1;
    camera.x = (canvas.clientWidth - world.width) / 2;
    camera.y = (canvas.clientHeight - world.height) / 2;
    draw();
};

document.getElementById("pause").onclick = e => {
    paused = !paused;
    e.target.textContent = paused ? "▶ Continuar" : "Ⅱ Pausar";
};

function loop() {
    if (!paused) {
        tick++;
        updatePeople();
        draw();
    }

    requestAnimationFrame(loop);
}

people.forEach(newDestination);

resize();
loop();
