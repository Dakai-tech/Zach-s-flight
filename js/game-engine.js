// 3D游戏引擎核心
class GameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.modelGenerator = new FighterModelGenerator();

        // 游戏状态
        this.gameState = 'menu'; // menu, playing, round_end, game_over
        this.round = 1;
        this.maxRounds = 5;
        this.playerMatchScore = 0;
        this.enemyMatchScore = 0;
        this.playerRoundScore = 0;
        this.enemyRoundScore = 0;

        // 玩家数据
        this.playerFighter = null;
        this.playerFighterType = 'china';
        this.playerHealth = 100;
        this.playerMaxHealth = 100;
        this.playerPosition = new THREE.Vector3(0, 0, 0);
        this.playerVelocity = new THREE.Vector3(0, 0, 0);
        this.playerSpeed = 0.4;
        this.playerRotation = 0;

        // 敌人数据
        this.enemyFighter = null;
        this.enemyFighterType = 'usa';
        this.enemyHealth = 100;
        this.enemyMaxHealth = 100;
        this.enemyPosition = new THREE.Vector3(0, 0, -15);
        this.enemyVelocity = new THREE.Vector3(0, 0, 0);
        this.enemySpeed = 0.35;

        // 子弹系统
        this.bullets = [];
        this.bulletSpeed = 1.2;
        this.bulletCooldown = 0;
        this.bulletCooldownMax = 8;

        // 爆炸效果
        this.explosions = [];

        // 输入状态
        this.keys = {};
        this.touchJoystick = { x: 0, y: 0, active: false };
        this.touchFire = false;

        // 摄像机
        this.cameraOffset = new THREE.Vector3(0, 3, 8);
        this.cameraTarget = new THREE.Vector3(0, 0, 0);

        // 统计数据
        this.shotsFired = 0;
        this.shotsHit = 0;

        // 动画循环
        this.animationId = null;
        this.lastTime = 0;

        // 游戏区域限制
        this.boundaryX = 25;
        this.boundaryY = 15;
        this.boundaryZ = 30;

        this.init();
    }

    init() {
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 20, 80);

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 3, 8);

        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // 添加灯光
        this.setupLights();

        // 添加环境
        const environment = this.modelGenerator.createEnvironment();
        this.scene.add(environment);

        // 事件监听
        this.setupEventListeners();

        // 窗口大小调整
        window.addEventListener('resize', () => this.onResize());
    }

    setupLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // 方向光（太阳）
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 50;
        dirLight.shadow.camera.left = -20;
        dirLight.shadow.camera.right = 20;
        dirLight.shadow.camera.top = 20;
        dirLight.shadow.camera.bottom = -20;
        this.scene.add(dirLight);

        // 半球光
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x2d4a3e, 0.5);
        this.scene.add(hemiLight);
    }

    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // 触摸控制
        this.setupTouchControls();
    }

    setupTouchControls() {
        const joystickArea = document.getElementById('joystick-area');
        const joystickKnob = document.getElementById('joystick-knob');
        const fireBtn = document.getElementById('fire-btn');

        if (!joystickArea || !fireBtn) return;

        // 摇杆
        let joystickStart = { x: 0, y: 0 };
        let joystickCenter = { x: 0, y: 0 };

        joystickArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = joystickArea.getBoundingClientRect();
            joystickCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            joystickStart = { x: touch.clientX, y: touch.clientY };
            this.touchJoystick.active = true;
        }, { passive: false });

        joystickArea.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.touchJoystick.active) return;

            const touch = e.touches[0];
            const maxDist = 35;
            let dx = touch.clientX - joystickCenter.x;
            let dy = touch.clientY - joystickCenter.y;

            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > maxDist) {
                dx = (dx / dist) * maxDist;
                dy = (dy / dist) * maxDist;
            }

            joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

            this.touchJoystick.x = dx / maxDist;
            this.touchJoystick.y = dy / maxDist;
        }, { passive: false });

        const endJoystick = (e) => {
            e.preventDefault();
            this.touchJoystick.active = false;
            this.touchJoystick.x = 0;
            this.touchJoystick.y = 0;
            joystickKnob.style.transform = 'translate(-50%, -50%)';
        };

        joystickArea.addEventListener('touchend', endJoystick);
        joystickArea.addEventListener('touchcancel', endJoystick);

        // 射击按钮
        fireBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchFire = true;
        }, { passive: false });

        const endFire = (e) => {
            e.preventDefault();
            this.touchFire = false;
        };

        fireBtn.addEventListener('touchend', endFire);
        fireBtn.addEventListener('touchcancel', endFire);
    }

    startGame(fighterType) {
        this.playerFighterType = fighterType;

        // 随机选择敌方战机（不同国家）
        const enemyTypes = ['usa', 'japan', 'france', 'russia'].filter(t => t !== fighterType);
        this.enemyFighterType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

        // 重置游戏状态
        this.round = 1;
        this.playerMatchScore = 0;
        this.enemyMatchScore = 0;

        this.startRound();
    }

    startRound() {
        this.gameState = 'playing';
        this.playerRoundScore = 0;
        this.enemyRoundScore = 0;
        this.playerHealth = this.playerMaxHealth;
        this.enemyHealth = this.enemyMaxHealth;
        this.playerPosition.set(0, 0, 0);
        this.enemyPosition.set(0, 2, -20);
        this.playerVelocity.set(0, 0, 0);
        this.enemyVelocity.set(0, 0, 0);
        this.bullets = [];
        this.explosions = [];
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.bulletCooldown = 0;

        // 清除旧战机
        if (this.playerFighter) {
            this.scene.remove(this.playerFighter);
        }
        if (this.enemyFighter) {
            this.scene.remove(this.enemyFighter);
        }

        // 创建玩家战机
        this.playerFighter = this.modelGenerator.getFighter(this.playerFighterType);
        this.playerFighter.position.copy(this.playerPosition);
        this.playerFighter.castShadow = true;
        this.scene.add(this.playerFighter);

        // 创建敌方战机
        this.enemyFighter = this.modelGenerator.getFighter(this.enemyFighterType);
        this.enemyFighter.position.copy(this.enemyPosition);
        this.enemyFighter.castShadow = true;
        this.scene.add(this.enemyFighter);

        // 更新UI
        this.updateHUD();
        this.showMessage(`第 ${this.round} 局 开始！`, 2000);

        // 开始游戏循环
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.lastTime = performance.now();
        this.gameLoop();
    }

    gameLoop() {
        if (this.gameState !== 'playing') return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 16.67; // 归一化到60fps
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        // 处理输入
        this.handleInput(deltaTime);

        // 更新玩家位置
        this.updatePlayer(deltaTime);

        // 更新AI敌人
        this.updateEnemy(deltaTime);

        // 更新子弹
        this.updateBullets(deltaTime);

        // 更新爆炸效果
        this.updateExplosions(deltaTime);

        // 更新相机
        this.updateCamera();

        // 检查回合结束
        this.checkRoundEnd();
    }

    handleInput(deltaTime) {
        const speed = this.playerSpeed * deltaTime;
        let moveX = 0;
        let moveY = 0;

        // 键盘输入
        if (this.keys['ArrowUp'] || this.keys['KeyW']) moveY -= speed;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) moveY += speed;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) moveX -= speed;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) moveX += speed;

        // 触摸输入
        if (this.touchJoystick.active) {
            moveX += this.touchJoystick.x * speed * 1.5;
            moveY += this.touchJoystick.y * speed * 1.5;
        }

        // 应用移动
        this.playerVelocity.x = moveX;
        this.playerVelocity.y = moveY;

        // 射击
        this.bulletCooldown -= deltaTime;
        const shouldFire = this.keys['Space'] || this.touchFire;

        if (shouldFire && this.bulletCooldown <= 0) {
            this.fireBullet(true);
            this.bulletCooldown = this.bulletCooldownMax;
            this.shotsFired++;
        }
    }

    updatePlayer(deltaTime) {
        // 应用速度
        this.playerPosition.x += this.playerVelocity.x;
        this.playerPosition.y += this.playerVelocity.y;

        // 边界限制
        this.playerPosition.x = Math.max(-this.boundaryX, Math.min(this.boundaryX, this.playerPosition.x));
        this.playerPosition.y = Math.max(-this.boundaryY, Math.min(this.boundaryY, this.playerPosition.y));
        this.playerPosition.z = Math.max(-this.boundaryZ, Math.min(this.boundaryZ, this.playerPosition.z));

        // 更新战机位置和旋转
        if (this.playerFighter) {
            this.playerFighter.position.copy(this.playerPosition);

            // 根据移动方向倾斜
            const tiltX = this.playerVelocity.y * 0.5;
            const tiltZ = -this.playerVelocity.x * 0.3;
            this.playerFighter.rotation.x = tiltX;
            this.playerFighter.rotation.z = tiltZ;

            // 平滑转向
            this.playerFighter.rotation.y += (this.playerRotation - this.playerFighter.rotation.y) * 0.1;
        }
    }

    updateEnemy(deltaTime) {
        // AI控制（由AI控制器处理）
        if (window.aiController) {
            window.aiController.update(this, deltaTime);
        }

        // 更新敌人位置
        this.enemyPosition.x += this.enemyVelocity.x;
        this.enemyPosition.y += this.enemyVelocity.y;
        this.enemyPosition.z += this.enemyVelocity.z;

        // 边界限制
        this.enemyPosition.x = Math.max(-this.boundaryX, Math.min(this.boundaryX, this.enemyPosition.x));
        this.enemyPosition.y = Math.max(-this.boundaryY, Math.min(this.boundaryY, this.enemyPosition.y));
        this.enemyPosition.z = Math.max(-this.boundaryZ - 10, Math.min(this.boundaryZ, this.enemyPosition.z));

        // 更新战机位置和旋转
        if (this.enemyFighter) {
            this.enemyFighter.position.copy(this.enemyPosition);

            // 面向玩家
            const direction = new THREE.Vector3();
            direction.subVectors(this.playerPosition, this.enemyPosition).normalize();
            const targetRotation = Math.atan2(direction.x, direction.z);
            this.enemyFighter.rotation.y += (targetRotation - this.enemyFighter.rotation.y) * 0.05;

            // 倾斜
            this.enemyFighter.rotation.x = this.enemyVelocity.y * 0.5;
            this.enemyFighter.rotation.z = -this.enemyVelocity.x * 0.3;
        }
    }

    fireBullet(isPlayer) {
        const bullet = this.modelGenerator.createBullet();

        if (isPlayer) {
            // 玩家子弹
            bullet.position.copy(this.playerPosition);
            bullet.position.z -= 2;
            bullet.userData = {
                velocity: new THREE.Vector3(0, 0, -this.bulletSpeed),
                isPlayer: true,
                life: 60
            };

            // 添加尾焰
            const trail = this.modelGenerator.createEngineTrail();
            trail.position.copy(bullet.position);
            trail.scale.set(0.3, 0.3, 0.3);
            bullet.add(trail);
        } else {
            // 敌人子弹
            bullet.position.copy(this.enemyPosition);
            bullet.position.z += 2;

            // 瞄准玩家
            const direction = new THREE.Vector3();
            direction.subVectors(this.playerPosition, this.enemyPosition).normalize();
            direction.multiplyScalar(this.bulletSpeed * 0.8);

            bullet.userData = {
                velocity: direction,
                isPlayer: false,
                life: 80
            };

            const trail = this.modelGenerator.createEngineTrail();
            trail.position.copy(bullet.position);
            trail.scale.set(0.3, 0.3, 0.3);
            bullet.add(trail);
        }

        this.scene.add(bullet);
        this.bullets.push(bullet);

        // 播放射击音效
        if (window.audioManager) {
            window.audioManager.playShoot();
        }
    }

    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            const data = bullet.userData;

            // 移动子弹
            bullet.position.add(data.velocity.clone().multiplyScalar(deltaTime));
            data.life -= deltaTime;

            // 检查生命周期
            if (data.life <= 0) {
                this.scene.remove(bullet);
                this.bullets.splice(i, 1);
                continue;
            }

            // 碰撞检测
            if (data.isPlayer) {
                // 检查是否击中敌人
                const dist = bullet.position.distanceTo(this.enemyPosition);
                if (dist < 2.5) {
                    this.enemyHealth -= 10;
                    this.shotsHit++;
                    this.createExplosion(this.enemyPosition.clone());
                    this.scene.remove(bullet);
                    this.bullets.splice(i, 1);

                    if (window.audioManager) {
                        window.audioManager.playHit();
                    }

                    // 检查敌人是否被击落
                    if (this.enemyHealth <= 0) {
                        this.playerRoundScore++;
                        this.showMessage('击中！', 1000);
                        this.enemyHealth = 0;
                    }

                    this.updateHUD();
                    continue;
                }
            } else {
                // 检查是否击中玩家
                const dist = bullet.position.distanceTo(this.playerPosition);
                if (dist < 2.5) {
                    this.playerHealth -= 10;
                    this.createExplosion(this.playerPosition.clone());
                    this.scene.remove(bullet);
                    this.bullets.splice(i, 1);

                    if (window.audioManager) {
                        window.audioManager.playHit();
                    }

                    // 检查玩家是否被击落
                    if (this.playerHealth <= 0) {
                        this.enemyRoundScore++;
                        this.showMessage('被击中！', 1000);
                        this.playerHealth = 0;
                    }

                    this.updateHUD();
                    continue;
                }
            }

            // 边界检查
            if (Math.abs(bullet.position.x) > this.boundaryX + 5 ||
                Math.abs(bullet.position.y) > this.boundaryY + 5 ||
                Math.abs(bullet.position.z) > this.boundaryZ + 10) {
                this.scene.remove(bullet);
                this.bullets.splice(i, 1);
            }
        }
    }

    createExplosion(position) {
        const explosion = this.modelGenerator.createExplosion();
        explosion.position.copy(position);
        this.scene.add(explosion);
        this.explosions.push(explosion);

        if (window.audioManager) {
            window.audioManager.playExplosion();
        }
    }

    updateExplosions(deltaTime) {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            const data = explosion.userData;
            data.life -= deltaTime * 0.02;

            if (data.life <= 0) {
                this.scene.remove(explosion);
                this.explosions.splice(i, 1);
                continue;
            }

            // 更新粒子
            explosion.children.forEach(child => {
                if (child.userData.velocity) {
                    child.position.add(child.userData.velocity.clone().multiplyScalar(deltaTime * 0.1));
                    child.material.opacity = data.life * child.userData.life;
                }
            });

            // 缩放闪光
            const flash = explosion.children[explosion.children.length - 1];
            if (flash && flash.geometry.type === 'SphereGeometry') {
                flash.scale.setScalar(1 + (1 - data.life) * 2);
                flash.material.opacity = data.life * 0.8;
            }

            explosion.scale.setScalar(1 + (1 - data.life) * 0.5);
        }
    }

    updateCamera() {
        // 跟随玩家
        const targetPos = this.playerPosition.clone().add(this.cameraOffset);
        this.camera.position.lerp(targetPos, 0.05);

        // 看向玩家前方
        const lookAt = this.playerPosition.clone();
        lookAt.z -= 5;
        this.camera.lookAt(lookAt);
    }

    checkRoundEnd() {
        // 检查是否有人被击落3次
        if (this.playerRoundScore >= 3 || this.enemyRoundScore >= 3) {
            this.endRound();
        }

        // 或者检查生命值
        if (this.playerHealth <= 0 && this.enemyHealth <= 0) {
            // 同时被击落，重新生成
            setTimeout(() => {
                if (this.gameState === 'playing') {
                    this.playerPosition.set(0, 0, 0);
                    this.enemyPosition.set(0, 2, -20);
                    this.playerHealth = this.playerMaxHealth;
                    this.enemyHealth = this.enemyMaxHealth;
                }
            }, 1000);
        }
    }

    endRound() {
        this.gameState = 'round_end';

        if (this.playerRoundScore >= 3) {
            this.playerMatchScore++;
        } else {
            this.enemyMatchScore++;
        }

        // 更新HUD
        this.updateHUD();

        // 显示回合结果
        setTimeout(() => {
            this.showRoundResult();
        }, 1000);
    }

    showRoundResult() {
        const roundScreen = document.getElementById('round-screen');
        const resultTitle = document.getElementById('round-result-title');
        const resultText = document.getElementById('round-result-text');
        const statHits = document.getElementById('stat-hits');
        const statAccuracy = document.getElementById('stat-accuracy');
        const statHealth = document.getElementById('stat-health');
        const nextBtn = document.getElementById('next-round-btn');

        const won = this.playerRoundScore >= 3;
        resultTitle.textContent = won ? '回合胜利！' : '回合失败';
        resultTitle.style.color = won ? '#4ade80' : '#f87171';
        resultText.textContent = `比分 ${this.playerRoundScore} - ${this.enemyRoundScore}`;

        statHits.textContent = this.shotsHit;
        const accuracy = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;
        statAccuracy.textContent = accuracy + '%';
        statHealth.textContent = Math.max(0, this.playerHealth) + '%';

        // 检查游戏是否结束
        if (this.playerMatchScore >= 3 || this.enemyMatchScore >= 3) {
            nextBtn.textContent = '查看最终结果';
            nextBtn.onclick = () => this.showGameOver();
        } else {
            nextBtn.textContent = '下一局';
            nextBtn.onclick = () => {
                this.round++;
                this.startRound();
                roundScreen.classList.remove('active');
            };
        }

        roundScreen.classList.add('active');
    }

    showGameOver() {
        this.gameState = 'game_over';

        const roundScreen = document.getElementById('round-screen');
        roundScreen.classList.remove('active');

        const gameoverScreen = document.getElementById('gameover-screen');
        const gameoverTitle = document.getElementById('gameover-title');
        const finalPlayerScore = document.getElementById('final-player-score');
        const finalEnemyScore = document.getElementById('final-enemy-score');
        const gameoverMessage = document.getElementById('gameover-message');

        const won = this.playerMatchScore >= 3;
        gameoverTitle.textContent = won ? '战斗胜利！' : '战斗失败';
        gameoverTitle.style.color = won ? '#4ade80' : '#f87171';

        finalPlayerScore.textContent = this.playerMatchScore;
        finalEnemyScore.textContent = this.enemyMatchScore;

        if (won) {
            gameoverMessage.textContent = '恭喜！你赢得了这场空战！';
        } else {
            gameoverMessage.textContent = '不要气馁，再来一局！';
        }

        gameoverScreen.classList.add('active');
    }

    updateHUD() {
        document.getElementById('player-score').textContent = this.playerRoundScore;
        document.getElementById('enemy-score').textContent = this.enemyRoundScore;
        document.getElementById('round-display').textContent = `第 ${this.round} 局`;
        document.getElementById('match-score').textContent = `${this.playerMatchScore} - ${this.enemyMatchScore}`;

        const healthPercent = Math.max(0, (this.playerHealth / this.playerMaxHealth) * 100);
        document.getElementById('player-health').style.width = healthPercent + '%';
    }

    showMessage(text, duration) {
        const messageArea = document.getElementById('message-area');
        const message = document.createElement('div');
        message.className = 'message';
        message.textContent = text;
        messageArea.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, duration);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    reset() {
        this.gameState = 'menu';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // 清除所有子弹
        this.bullets.forEach(bullet => this.scene.remove(bullet));
        this.bullets = [];

        // 清除所有爆炸
        this.explosions.forEach(exp => this.scene.remove(exp));
        this.explosions = [];

        // 清除战机
        if (this.playerFighter) {
            this.scene.remove(this.playerFighter);
            this.playerFighter = null;
        }
        if (this.enemyFighter) {
            this.scene.remove(this.enemyFighter);
            this.enemyFighter = null;
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}
