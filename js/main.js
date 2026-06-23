// 游戏主入口
let gameEngine = null;
let audioManager = null;
let aiController = null;

// 游戏配置
let gameConfig = {
    pilot: 'xiaojie',
    fighter: 'china',
    map: 'sky',
    music: 'epic',
    upgrades: {
        engine: 0,
        armor: 0,
        weapon: 0,
        missile: 0,
        radar: 0
    }
};

// 改装点数
let upgradePoints = 5;

// 改装定义
const upgradeDefinitions = {
    engine: { name: '引擎强化', desc: '提升飞行速度', max: 5, cost: 1 },
    armor: { name: '装甲加固', desc: '增加生命值', max: 5, cost: 1 },
    weapon: { name: '武器升级', desc: '提升机炮伤害', max: 5, cost: 1 },
    missile: { name: '导弹扩容', desc: '增加导弹数量', max: 5, cost: 1 },
    radar: { name: '雷达追踪', desc: '提升导弹精度', max: 5, cost: 1 }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

function initGame() {
    audioManager = new AudioManager();
    aiController = new AIController();
    window.aiController = aiController;
    window.audioManager = audioManager;

    gameEngine = new GameEngine();
    window.gameEngine = gameEngine;

    setupUIEvents();
    renderUpgradeUI();
    showScreen('start-screen');
}

function setupUIEvents() {
    // 驾驶员选择
    const pilotCards = document.querySelectorAll('.pilot-card');
    pilotCards.forEach(card => {
        card.addEventListener('click', () => {
            pilotCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            gameConfig.pilot = card.dataset.pilot;
        });
    });

    // 战机选择
    const fighterCards = document.querySelectorAll('.fighter-card');
    fighterCards.forEach(card => {
        card.addEventListener('click', () => {
            fighterCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            gameConfig.fighter = card.dataset.fighter;
        });
    });

    // 地图选择
    const mapCards = document.querySelectorAll('.map-card');
    mapCards.forEach(card => {
        card.addEventListener('click', () => {
            mapCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            gameConfig.map = card.dataset.map;
        });
    });

    // 音乐选择
    const musicCards = document.querySelectorAll('.music-card');
    musicCards.forEach(card => {
        card.addEventListener('click', () => {
            musicCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            gameConfig.music = card.dataset.music;
        });
    });

    // 开始按钮
    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', async () => {
        await audioManager.init();
        audioManager.playStart();

        // 根据选择的音乐播放背景音乐
        if (gameConfig.music !== 'silent') {
            audioManager.startBGM(gameConfig.music);
        }

        showScreen('game-screen');
        gameEngine.startGame(gameConfig);
    });

    // 重新开始按钮
    const restartBtn = document.getElementById('restart-btn');
    restartBtn.addEventListener('click', () => {
        audioManager.playStart();
        if (gameConfig.music !== 'silent') {
            audioManager.startBGM(gameConfig.music);
        }
        showScreen('game-screen');
        gameEngine.startGame(gameConfig);
    });

    // 返回菜单按钮
    const menuBtn = document.getElementById('menu-btn');
    menuBtn.addEventListener('click', () => {
        audioManager.stopBGM();
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

function renderUpgradeUI() {
    const container = document.getElementById('upgrades-container');
    if (!container) return;

    container.innerHTML = '';

    Object.keys(upgradeDefinitions).forEach(key => {
        const def = upgradeDefinitions[key];
        const currentLevel = gameConfig.upgrades[key];

        const item = document.createElement('div');
        item.className = 'upgrade-item';
        item.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">${def.name}</div>
                <div class="upgrade-desc">${def.desc}</div>
            </div>
            <div class="upgrade-buttons">
                <button class="upgrade-btn" data-upgrade="${key}" data-action="decrease" ${currentLevel <= 0 ? 'disabled' : ''}>−</button>
                <span class="upgrade-level">${currentLevel}/${def.max}</span>
                <button class="upgrade-btn" data-upgrade="${key}" data-action="increase" ${currentLevel >= def.max || upgradePoints < def.cost ? 'disabled' : ''}>+</button>
            </div>
        `;

        container.appendChild(item);
    });

    // 更新点数显示
    document.getElementById('upgrade-points').textContent = upgradePoints;

    // 绑定按钮事件
    container.querySelectorAll('.upgrade-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const key = e.target.dataset.upgrade;
            const action = e.target.dataset.action;
            const def = upgradeDefinitions[key];

            if (action === 'increase' && upgradePoints >= def.cost && gameConfig.upgrades[key] < def.max) {
                gameConfig.upgrades[key]++;
                upgradePoints -= def.cost;
            } else if (action === 'decrease' && gameConfig.upgrades[key] > 0) {
                gameConfig.upgrades[key]--;
                upgradePoints += def.cost;
            }

            renderUpgradeUI();
        });
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
    }
}

document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'Enter') && e.target === document.body) {
        e.preventDefault();
    }
});

document.addEventListener('visibilitychange', () => {
    if (gameEngine && gameEngine.gameState === 'playing') {
        if (document.hidden) {
            if (gameEngine.animationId) {
                cancelAnimationFrame(gameEngine.animationId);
                gameEngine.animationId = null;
            }
        } else {
            gameEngine.lastTime = performance.now();
            gameEngine.gameLoop();
        }
    }
});
