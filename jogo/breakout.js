//tabuleiro
let board;
let boardWidth = 500;
let boardHeight = 500;
let context; 

//jogadores
let playerWidth = 80; //500 para testes, 80 normal
let playerHeight = 10;
let playerVelocityX = 30; //mover 10 pixels de cada vez

let player = {
    x : boardWidth/2 - playerWidth/2,
    y : boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX : playerVelocityX
}

//bola
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 6; //15 para testes, 3 normal
let ballVelocityY = 3; //10 para testes, 2 normal

let ball = {
    x : boardWidth/2,
    y : boardHeight/2,
    width: ballWidth,
    height: ballHeight,
    velocityX : ballVelocityX,
    velocityY : ballVelocityY
}

//blocos
let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8; 
let blockRows = 3; //adicionar mais conforme o jogo avança
let blockMaxRows = 10; //limitar quantas linhas
let blockCount = 0;

//posição inicial dos blocos, canto superior esquerdo
let blockX = 15;
let blockY = 45;

let score = 0;
let gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //usado para desenhar no tabuleiro

    //desenhar jogador inicial
    context.fillStyle="skyblue";
    context.fillRect(player.x, player.y, player.width, player.height);

    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);

    //criar blocos
    createBlocks();
}

function update() {
    requestAnimationFrame(update);
    //parar de desenhar
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // jogador
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

    // bola
    context.fillStyle = "white";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    //fazer a bola quicar na raquete do jogador
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1;   // inverte a direção y para cima ou para baixo
    }
    else if (leftCollision(ball, player) || rightCollision(ball, player)) {
        ball.velocityX *= -1;   // inverte a direção x para esquerda ou direita
    }

    if (ball.y <= 0) { 
        // se a bola tocar o topo do canvas
        ball.velocityY *= -1; //inverte a direção
    }
    else if (ball.x <= 0 || (ball.x + ball.width >= boardWidth)) {
        // se a bola tocar a esquerda ou direita do canvas
        ball.velocityX *= -1; //inverte a direção
    }
    else if (ball.y + ball.height >= boardHeight) {
        // se a bola tocar o fundo do canvas
        context.font = "20px sans-serif";
        context.fillText("Game Over: Aperte 'espaço' Para Reiniciar", 80, 400);
        gameOver = true;
    }

    //blocos
    context.fillStyle = "skyblue";
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break) {
            if (topCollision(ball, block) || bottomCollision(ball, block)) {
                block.break = true;     // bloco quebrado
                ball.velocityY *= -1;   // inverte a direção y para cima ou para baixo
                score += 100;
                blockCount -= 1;
            }
            else if (leftCollision(ball, block) || rightCollision(ball, block)) {
                block.break = true;     // bloco quebrado
                ball.velocityX *= -1;   // inverte a direção x para esquerda ou direita
                score += 100;
                blockCount -= 1;
            }
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    //próximo nível
    if (blockCount == 0) {
        score += 100*blockRows*blockColumns; //pontos bônus :)
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        createBlocks();
    }

    //pontuação
    context.font = "20px sans-serif";
    context.fillText(score, 10, 25);
}

function outOfBounds(xPosition) {
    return (xPosition < 0 || xPosition + playerWidth > boardWidth);
}

function movePlayer(e) {
    if (gameOver) {
        if (e.code == "Space") {
            resetGame();
            console.log("RESET");
        }
        return;
    }
    if (e.code == "ArrowLeft") {
        // player.x -= player.velocityX;
        let nextplayerX = player.x - player.velocityX;
        if (!outOfBounds(nextplayerX)) {
            player.x = nextplayerX;
        }
    }
    else if (e.code == "ArrowRight") {
        let nextplayerX = player.x + player.velocityX;
        if (!outOfBounds(nextplayerX)) {
            player.x = nextplayerX;
        }
        // player.x += player.velocityX;    
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //o canto superior esquerdo de a não alcança o canto superior direito de b
           a.x + a.width > b.x &&   //o canto superior direito de a passa o canto superior esquerdo de b
           a.y < b.y + b.height &&  //o canto superior esquerdo de a não alcança o canto inferior esquerdo de b
           a.y + a.height > b.y;    //o canto inferior esquerdo de a passa o canto superior esquerdo de b
}

function topCollision(ball, block) { //a está acima de b (bola está acima do bloco)
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
}

function bottomCollision(ball, block) { //a está acima de b (bola está abaixo do bloco)
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) { //a está à esquerda de b (bola está à esquerda do bloco)
    return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rightCollision(ball, block) { //a está à direita de b (bola está à direita do bloco)
    return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
}

function createBlocks() {
    blockArray = []; //limpar blockArray
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x : blockX + c*blockWidth + c*10, //c*10 espaço 10 pixels entre colunas
                y : blockY + r*blockHeight + r*10, //r*10 espaço 10 pixels entre linhas
                width : blockWidth,
                height : blockHeight,
                break : false
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame() {
    gameOver = false;
    player = {
        x : boardWidth/2 - playerWidth/2,
        y : boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX : playerVelocityX
    }
    ball = {
        x : boardWidth/2,
        y : boardHeight/2,
        width: ballWidth,
        height: ballHeight,
        velocityX : ballVelocityX,
        velocityY : ballVelocityY
    }
    blockArray = [];
    blockRows = 3;
    score = 0;
    createBlocks();
}
