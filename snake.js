/* --- Lógica do Music Snake (Auto-Play / Background) --- */

const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');

let box = 20; // Tamanho do quadrado
let canvasWidth, canvasHeight;
let snake = [];
let food = {};
let direction = "RIGHT";
let gameInterval;

// Símbolos musicais
const musicNotes = ['♩', '♪', '♫', '♬', '♭', '♯'];

// Inicializa o tamanho do canvas
function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Recalcula box baseado na tela para não ficar muito pequeno ou grande
    box = Math.max(20, Math.floor(canvasWidth / 60)); 
}

// Inicializa a cobrinha
function initGame() {
    resizeCanvas();
    snake = [
        { x: 10 * box, y: Math.floor((canvasHeight/box)/2) * box },
        { x: 9 * box, y: Math.floor((canvasHeight/box)/2) * box },
        { x: 8 * box, y: Math.floor((canvasHeight/box)/2) * box }
    ];
    createFood();
    direction = "RIGHT";
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, 100); // Velocidade
}

function createFood() {
    // Garante que a comida não nasça em cima da cobra
    let valid = false;
    while (!valid) {
        food = {
            x: Math.floor(Math.random() * (canvasWidth / box)) * box,
            y: Math.floor(Math.random() * (canvasHeight / box)) * box,
            symbol: musicNotes[Math.floor(Math.random() * musicNotes.length)]
        };
        
        valid = true;
        for (let part of snake) {
            if (part.x === food.x && part.y === food.y) valid = false;
        }
    }
}

// Lógica da IA (Cérebro da Cobrinha)
function aiMove() {
    const head = snake[0];
    
    // Possíveis movimentos
    const moves = [
        { dir: "UP", x: head.x, y: head.y - box },
        { dir: "DOWN", x: head.x, y: head.y + box },
        { dir: "LEFT", x: head.x - box, y: head.y },
        { dir: "RIGHT", x: head.x + box, y: head.y }
    ];

    // Filtra movimentos que matariam a cobra (paredes ou corpo)
    const safeMoves = moves.filter(m => {
        // Colisão com parede
        if (m.x < 0 || m.x >= canvasWidth || m.y < 0 || m.y >= canvasHeight) return false;
        // Colisão com corpo
        for (let part of snake) {
            if (m.x === part.x && m.y === part.y) return false;
        }
        return true;
    });

    if (safeMoves.length === 0) {
        // Sem saída: reinicia o jogo suavemente
        initGame();
        return;
    }

    // Dentre os movimentos seguros, escolhe o que aproxima da comida
    let bestMove = safeMoves[0];
    let minDistance = 999999;

    for (let move of safeMoves) {
        // Calcula distância até a comida (Manhattan Distance é suficiente aqui)
        let distance = Math.abs(move.x - food.x) + Math.abs(move.y - food.y);
        
        // Evita mudança brusca de 180 graus (ex: ir para esquerda se está indo para direita)
        if ((direction === "RIGHT" && move.dir === "LEFT") ||
            (direction === "LEFT" && move.dir === "RIGHT") ||
            (direction === "UP" && move.dir === "DOWN") ||
            (direction === "DOWN" && move.dir === "UP")) {
            continue; 
        }

        if (distance < minDistance) {
            minDistance = distance;
            bestMove = move;
        }
    }

    // Se a lógica acima filtrar tudo (ex: beco sem saída), pega um aleatório seguro
    if (!bestMove && safeMoves.length > 0) {
        bestMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
    }
    
    if (bestMove) {
        direction = bestMove.dir;
    }
}

function drawBackground() {
    // Limpa
    ctx.fillStyle = "#0d1117"; // Fundo Escuro
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Desenha a Pauta (5 linhas no centro da tela)
    ctx.strokeStyle = "#30363d"; // Cinza escuro (sutil)
    ctx.lineWidth = 2;
    
    const centerY = canvasHeight / 2;
    const lineSpacing = 20; // Espaço entre linhas da pauta

    for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(0, centerY + (i * lineSpacing));
        ctx.lineTo(canvasWidth, centerY + (i * lineSpacing));
        ctx.stroke();
    }

    // Desenha a Clave de Sol Gigante (Decorativa)
    ctx.fillStyle = "#21262d"; // Cinza um pouco mais claro que o fundo
    ctx.font = "300px serif"; // Fonte grande
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("𝄞", 50, centerY); 
}

function updateGame() {
    // 1. Calcula movimento da IA
    aiMove();

    // 2. Desenha Fundo
    drawBackground();

    // 3. Atualiza Posição
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction == "LEFT") snakeX -= box;
    if (direction == "UP") snakeY -= box;
    if (direction == "RIGHT") snakeX += box;
    if (direction == "DOWN") snakeY += box;

    // 4. Verifica Comida
    // Aumenta a "hitbox" da comida levemente para facilitar visualmente
    if (Math.abs(snakeX - food.x) < box && Math.abs(snakeY - food.y) < box) {
        createFood();
        // Não remove a cauda (cresce)
    } else {
        snake.pop(); // Remove cauda
    }

    // 5. Adiciona nova cabeça
    let newHead = { x: snakeX, y: snakeY };
    snake.unshift(newHead);

    // 6. Desenha Comida
    ctx.fillStyle = "#58a6ff"; // Azul Neon (Estilo GitHub Link)
    ctx.font = `${box}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(food.symbol, food.x + box/2, food.y + box/2);

    // 7. Desenha Cobra
    for (let i = 0; i < snake.length; i++) {
        // Cabeça azul claro, corpo com opacidade decrescente (rastro)
        ctx.fillStyle = i === 0 ? "#58a6ff" : `rgba(88, 166, 255, ${1 - i/snake.length})`; 
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }
}

// Inicia e trata redimensionamento da janela
window.addEventListener('resize', () => {
    resizeCanvas();
    createFood(); // Recria comida se a tela mudar
});

// Começa o jogo ao carregar
initGame();