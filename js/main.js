// 游戏主入口
let gameEngine = null;
let audioManager = null;
let aiController = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

function initGame() {
    // 初始化音频
    audioManager = new AudioManager();

    // 初始化AI
    aiController = new AIController();
    window.aiController = aiController;
    window.audioManager = audioManager;

    // 初始化游戏引擎
    gameEngine = new GameEngine();
    window.gameEngine = gameEngine;

    // 设置UI事件
    setupUIEvents();

    // 显示开始界面
    showScreen('start-screen');
}

function setupUIEvents() {
    // 战机选择
    const fighterCards = document.querySelectorAll('.fighter-card');
    let selectedFighter = 'china';

    fighterCards.forEach(card => {
        card.addEventListener('click', () => {
            fighterCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedFighter = card.dataset.fighter;
        });
    });

    // 开始按钮
    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', async () => {
        // 初始化音频（需要用户交互）
        await audioManager.init();
        audioManager.playStart();

        // 隐藏开始界面，显示游戏界面
        showScreen('game-screen');

        // 开始游戏
        gameEngine.startGame(selectedFighter);
    });

    // 重新开始按钮
    const restartBtn = document.getElementById('restart-btn');
    restartBtn.addEventListener('click', () => {
        audioManager.playStart();
        showScreen('game-screen');
        gameEngine.startGame(selectedFighter);
    });

    // 返回菜单按钮
    const menuBtn = document.getElementById('menu-btn');
    menuBtn.addEventListener('click', () => {
        gameEngine.reset();
        showScreen('start-screen');
    });

    // 防止触摸滚动
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('#game-screen')) {
            e.preventDefault();
        }
    }, { passive: false });
}

function showScreen(screenId) {
    // 隐藏所有界面
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // 显示指定界面
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
    }
}

// 防止空格键滚动页面
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
    }
});

// 处理可见性变化（页面切换时暂停）
document.addEventListener('visibilitychange', () => {
    if (gameEngine && gameEngine.gameState === 'playing') {
        if (document.hidden) {
            // 暂停
            if (gameEngine.animationId) {
                cancelAnimationFrame(gameEngine.animationId);
                gameEngine.animationId = null;
            }
        } else {
            // 恢复
            gameEngine.lastTime = performance.now();
            gameEngine.gameLoop();
        }
    }
});
