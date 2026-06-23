// 3D游戏引擎核心
class GameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.modelGenerator = new FighterModelGenerator();

        // 游戏状态
        this.gameState = 'menu';
        this.round = 1;
        this.maxRounds = 5;
        this.playerMatchScore = 0;
        this.enemyMatchScore = 0;
        this.playerRoundScore = 0;
        this.enemyRoundScore = 0;

        // 玩家数据
        this.playerFighter = null;
        this.playerFighterType = 'china';
        this.playerPilot = 'xiaojie';
        this.playerMap = 'sky';
        this.playerMusic = 'epic';
        this.playerHealth = 100;
        this.playerMaxHealth = 100;
        this.playerPosition = new THREE.Vector3(0, 0, 0);
        this.playerVelocity = new THREE.Vector3(0, 0, 0);
        this.playerSpeed = 0.4;
        this.playerRotation = 0;

        // 改装系统
        this.upgrades = {
            engine: 0,      // 引擎升级 - 速度
            armor: 0,       // 装甲升级 - 生命值
            weapon: 0,      // 武器升级 - 伤害
            missile: 0,     // 导弹升级 - 导弹数量和伤害
            radar: 0        // 雷达升级 - 追踪精度
        };
        this.upgradePoints = 5;

        // 敌人数据
        this.enemyFighter = null;
        this.enemyFighterType = 'usa';
        this.enemyHealth = 100;
        this.enemyMaxHealth = 100;
        this.enemyPosition = new THREE.Vector3(0, 0, 0);
        this.enemyVelocity = new THREE.Vector3(0, 0, 0);
        this.enemySpeed = 0.35;

        // BOSS模式
        this.isBossMode = false;
        this.bossName = '';
        this.bossMaxHealth = 300;

        // 武器系统
        this.bullets = [];
        this.missiles = [];
        this.bulletSpeed = 1.2;
        this.missileSpeed = 0.8;
        this.bulletCooldown = 0;
        this.bulletCooldownMax = 8;
        this.missileCooldown = 0;
        this.missileCooldownMax = 120;
        this.missileCount = 3;

        // 爆炸效果
        this.explosions = [];

        // 输入状态
        this.keys = {};
        this.touchJoystick = { x: 0, y: 0, active: false };
        this.touchFire = false;
        this.touchMissile = false;

        // 摄像机
        this.cameraOffset = new THREE.Vector3(0, 4, 12);
        this.cameraTarget = new THREE.Vector3(0, 0, 0);

        // 统计数据
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.missilesFired = 0;
        this.missilesHit = 0;

        // 动画循环
        this.animationId = null;
        this.lastTime = 0;

        // 游戏区域限制
        this.boundaryX = 30;
        this.boundaryY = 18;
        this.boundaryZ = 40;

        // 初始距离
        this.initialDistance = 50;

        // 地图环境
        this.currentEnvironment = null;

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 30, 100);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camera.position.set(0, 4, 12);

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.setupLights();
        this.setupEventListeners();
        window.addEventListener('resize', () => this.onResize());
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);

        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x2d4a3e, 0.5);
        this.scene.add(hemiLight);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        this.setupTouchControls();
    }

    setupTouchControls() {
        const joystickArea = document.getElementById('joystick-area');
        const joystickKnob = document.getElementById('joystick-knob');
        const fireBtn = document.getElementById('fire-btn');
        const missileBtn = document.getElementById('missile-btn');

        if (!joystickArea || !fireBtn) return;

        let joystickStart = { x: 0, y: 0 };
        let joystickCenter = { x: 0, y: 0 };

        joystickArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = joystickArea.getBoundingClientRect();
            joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
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

        if (missileBtn) {
            missileBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.touchMissile = true;
            }, { passive: false });

            const endMissile = (e) => {
                e.preventDefault();
                this.touchMissile = false;
            };

            missileBtn.addEventListener('touchend', endMissile);
            missileBtn.addEventListener('touchcancel', endMissile);
        }
    }

    startGame(config) {
        this.playerFighterType = config.fighter || 'china';
        this.playerPilot = config.pilot || 'xiaojie';
        this.playerMap = config.map || 'sky';
        this.playerMusic = config.music || 'epic';
        this.upgrades = config.upgrades || { engine: 0, armor: 0, weapon: 0, missile: 0, radar: 0 };

        // 应用驾驶员加成
        this.applyPilotBonus();

        // 应用改装加成
        this.applyUpgradeBonus();

        // 随机选择敌方战机
        const enemyTypes = ['usa', 'japan', 'france', 'russia'].filter(t => t !== this.playerFighterType);
        this.enemyFighterType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

        this.round = 1;
        this.playerMatchScore = 0;
        this.enemyMatchScore = 0;

        this.startRound();
    }

    applyPilotBonus() {
        switch(this.playerPilot) {
            case 'xiaojie': // 小杰 - 机炮射速+10%
                this.bulletCooldownMax = 8 * 0.9;
                break;
            case 'xiaomei': // 小美 - 导弹伤害+20%
                // 在导弹发射时应用
                break;
            case 'laowang': // 老王 - 装甲+15%
                this.playerMaxHealth = 100 * 1.15;
                this.playerHealth = this.playerMaxHealth;
                break;
            case 'xiaogang': // 小刚 - 速度+15%
                this.playerSpeed = 0.4 * 1.15;
                break;
            case 'xiaohua': // 小华 - 改装效果+25%
                this.upgradeMultiplier = 1.25;
                break;
        }
    }

    applyUpgradeBonus() {
        const mult = this.playerPilot === 'xiaohua' ? 1.25 : 1.0;

        // 引擎升级 - 速度
        this.playerSpeed += this.upgrades.engine * 0.05 * mult;

        // 装甲升级 - 生命值
        this.playerMaxHealth += this.upgrades.armor * 15 * mult;
        this.playerHealth = this.playerMaxHealth;

        // 武器升级 - 伤害
        this.bulletDamage = 10 + this.upgrades.weapon * 3 * mult;

        // 导弹升级 - 数量和伤害
        this.missileCount = 3 + this.upgrades.missile;
        this.missileDamage = 30 + this.upgrades.missile * 8 * mult;

        // 雷达升级 - 追踪精度
        this.missileTracking = 0.05 + this.upgrades.radar * 0.02 * mult;
    }

    startRound() {
        this.gameState = 'playing';
        this.playerRoundScore = 0;
        this.enemyRoundScore = 0;
        this.playerHealth = this.playerMaxHealth;

        // 检查是否是BOSS战（第5局）
        this.isBossMode = (this.round === 5);

        if (this.isBossMode) {
            this.enemyMaxHealth = this.bossMaxHealth;
            this.enemyHealth = this.bossMaxHealth;
            this.enemySpeed = 0.45; // BOSS更快
        } else {
            this.enemyMaxHealth = 100 + (this.round - 1) * 20; // 每局敌人变强
            this.enemyHealth = this.enemyMaxHealth;
        }

        this.playerPosition.set(0, 0, this.initialDistance / 2);
        this.enemyPosition.set(0, 2, -this.initialDistance / 2);
        this.playerVelocity.set(0, 0, 0);
        this.enemyVelocity.set(0, 0, 0);
        this.bullets = [];
        this.missiles = [];
        this.explosions = [];
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.missilesFired = 0;
        this.missilesHit = 0;
        this.bulletCooldown = 0;
        this.missileCooldown = 0;

        // 清除旧场景
        this.clearScene();

        // 添加地图环境
        this.currentEnvironment = this.modelGenerator.getMap(this.playerMap);
        this.scene.add(this.currentEnvironment);

        // 创建玩家战机
        this.playerFighter = this.modelGenerator.getFighter(this.playerFighterType);
        this.playerFighter.position.copy(this.playerPosition);
        this.playerFighter.rotation.y = Math.PI;
        this.playerFighter.castShadow = true;
        this.scene.add(this.playerFighter);

        // 创建敌方战机/BOSS
        if (this.isBossMode) {
            this.enemyFighter = this.modelGenerator.createBossFighter(this.enemyFighterType);
            this.showBossHUD();
        } else {
            this.enemyFighter = this.modelGenerator.getFighter(this.enemyFighterType);
            this.hideBossHUD();
        }
        this.enemyFighter.position.copy(this.enemyPosition);
        this.enemyFighter.rotation.y = 0;
        this.enemyFighter.castShadow = true;
        this.scene.add(this.enemyFighter);

        // 更新UI
        this.updateHUD();

        const roundText = this.isBossMode ? 'BOSS战！' : `第 ${this.round} 局`;
        this.showMessage(roundText + ' 开始！', 2000);

        if (this.isBossMode) {
            this.showMessage('⚠️ 首领出现！', 1500);
        }

        // 开始游戏循环
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.lastTime = performance.now();
        this.gameLoop();
    }

    clearScene() {
        // 清除战机
        if (this.playerFighter) {
            this.scene.remove(this.playerFighter);
            this.playerFighter = null;
        }
        if (this.enemyFighter) {
            this.scene.remove(this.enemyFighter);
            this.enemyFighter = null;
        }

        // 清除子弹
        this.bullets.forEach(bullet => this.scene.remove(bullet));
        this.bullets = [];

        // 清除导弹
        this.missiles.forEach(missile => this.scene.remove(missile));
        this.missiles = [];

        // 清除爆炸
        this.explosions.forEach(exp => this.scene.remove(exp));
        this.explosions = [];

        // 清除环境
        if (this.currentEnvironment) {
            this.scene.remove(this.currentEnvironment);
            this.currentEnvironment = null;
        }
    }

    showBossHUD() {
        const bossHud = document.getElementById('boss-hud');
        if (bossHud) {
            bossHud.classList.remove('hidden');
            const bossNames = {
                'sky': '天空霸主',
                'storm': '雷霆之王',
                'night': '暗影猎手',
                'ocean': '深海巨兽',
                'volcano': '熔岩暴君'
            };
            this.bossName = bossNames[this.playerMap] || '首领';
            document.getElementById('boss-name').textContent = this.bossName;
        }
    }

    hideBossHUD() {
        const bossHud = document.getElementById('boss-hud');
        if (bossHud) {
            bossHud.classList.add('hidden');
        }
    }

    updateBossHUD() {
        if (!this.isBossMode) return;
        const healthPercent = Math.max(0, (this.enemyHealth / this.enemyMaxHealth) * 100);
        const fill = document.getElementById('boss-health-fill');
        const text = document.getElementById('boss-health-text');
        if (fill) fill.style.width = healthPercent + '%';
        if (text) text.textContent = Math.round(healthPercent) + '%';
    }

    gameLoop() {
        if (this.gameState !== 'playing') return;
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 16.67;
        this.lastTime = currentTime;
        this.update(deltaTime);
        this.render();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        this.handleInput(deltaTime);
        this.updatePlayer(deltaTime);
        this.updateEnemy(deltaTime);
        this.updateBullets(deltaTime);
        this.updateMissiles(deltaTime);
        this.updateExplosions(deltaTime);
        this.updateCamera();
        this.updateBossHUD();
        this.checkRoundEnd();
    }

    handleInput(deltaTime) {
        const speed = this.playerSpeed * deltaTime;
        let moveX = 0;
        let moveY = 0;

        if (this.keys['ArrowUp'] || this.keys['KeyW']) moveY += speed;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) moveY -= speed;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) moveX -= speed;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) moveX += speed;

        if (this.touchJoystick.active) {
            moveX += this.touchJoystick.x * speed * 1.5;
            moveY -= this.touchJoystick.y * speed * 1.5;
        }

        this.playerVelocity.x = moveX;
        this.playerVelocity.y = moveY;

        this.bulletCooldown -= deltaTime;
        const shouldFire = this.keys['Space'] || this.touchFire;

        if (shouldFire && this.bulletCooldown <= 0) {
            this.fireBullet(true);
            this.bulletCooldown = this.bulletCooldownMax;
            this.shotsFired++;
        }

        this.missileCooldown -= deltaTime;
        const shouldMissile = this.keys['Enter'] || this.touchMissile;

        if (shouldMissile && this.missileCooldown <= 0 && this.missileCount > 0) {
            this.fireMissile(true);
            this.missileCooldown = this.missileCooldownMax;
            this.missileCount--;
            this.missilesFired++;
        }
    }

    updatePlayer(deltaTime) {
        this.playerPosition.x += this.playerVelocity.x;
        this.playerPosition.y += this.playerVelocity.y;

        this.playerPosition.x = Math.max(-this.boundaryX, Math.min(this.boundaryX, this.playerPosition.x));
        this.playerPosition.y = Math.max(-this.boundaryY, Math.min(this.boundaryY, this.playerPosition.y));
        this.playerPosition.z = Math.max(-this.boundaryZ, Math.min(this.boundaryZ, this.playerPosition.z));

        if (this.playerFighter) {
            this.playerFighter.position.copy(this.playerPosition);
            const tiltX = this.playerVelocity.y * 0.5;
            const tiltZ = -this.playerVelocity.x * 0.3;
            this.playerFighter.rotation.x = tiltX;
            this.playerFighter.rotation.z = tiltZ;
            this.playerFighter.rotation.y += (Math.PI - this.playerFighter.rotation.y) * 0.1;
        }
    }

    updateEnemy(deltaTime) {
        if (window.aiController) {
            window.aiController.update(this, deltaTime);
        }

        this.enemyPosition.x += this.enemyVelocity.x;
        this.enemyPosition.y += this.enemyVelocity.y;
        this.enemyPosition.z += this.enemyVelocity.z;

        this.enemyPosition.x = Math.max(-this.boundaryX, Math.min(this.boundaryX, this.enemyPosition.x));
        this.enemyPosition.y = Math.max(-this.boundaryY, Math.min(this.boundaryY, this.enemyPosition.y));
        this.enemyPosition.z = Math.max(-this.boundaryZ - 10, Math.min(this.boundaryZ, this.enemyPosition.z));

        if (this.enemyFighter) {
            this.enemyFighter.position.copy(this.enemyPosition);
            const direction = new THREE.Vector3();
            direction.subVectors(this.playerPosition, this.enemyPosition).normalize();
            const targetRotation = Math.atan2(direction.x, direction.z);
            this.enemyFighter.rotation.y += (targetRotation - this.enemyFighter.rotation.y) * 0.05;
            this.enemyFighter.rotation.x = this.enemyVelocity.y * 0.5;
            this.enemyFighter.rotation.z = -this.enemyVelocity.x * 0.3;
        }
    }

    fireBullet(isPlayer) {
        const bullet = this.modelGenerator.createBullet();

        if (isPlayer) {
            bullet.position.copy(this.playerPosition);
            bullet.position.z -= 2;
            bullet.userData = {
                velocity: new THREE.Vector3(0, 0, -this.bulletSpeed),
                isPlayer: true,
                life: 60,
                damage: this.bulletDamage || 10
            };
            const trail = this.modelGenerator.createEngineTrail();
            trail.position.copy(bullet.position);
            trail.scale.set(0.3, 0.3, 0.3);
            bullet.add(trail);
        } else {
            bullet.position.copy(this.enemyPosition);
            bullet.position.z += 2;
            const direction = new THREE.Vector3();
            direction.subVectors(this.playerPosition, this.enemyPosition).normalize();
            direction.multiplyScalar(this.bulletSpeed * 0.8);
            bullet.userData = {
                velocity: direction,
                isPlayer: false,
                life: 80,
                damage: this.isBossMode ? 15 : 10
            };
            const trail = this.modelGenerator.createEngineTrail();
            trail.position.copy(bullet.position);
            trail.scale.set(0.3, 0.3, 0.3);
            bullet.add(trail);
        }

        this.scene.add(bullet);
        this.bullets.push(bullet);

        if (window.audioManager) {
            window.audioManager.playShoot();
        }
    }

    fireMissile(isPlayer) {
        const missile = this.modelGenerator.createMissile();

        if (isPlayer) {
            missile.position.copy(this.playerPosition);
            missile.position.z -= 2.5;
            missile.userData = {
                velocity: new THREE.Vector3(0, 0, -this.missileSpeed),
                isPlayer: true,
                life: 150,
                damage: this.missileDamage || 30,
                isMissile: true,
                target: this.enemyPosition.clone()
            };
        } else {
            missile.position.copy(this.enemyPosition);
            missile.position.z += 2.5;
            const direction = new THREE.Vector3();
            direction.subVectors(this.playerPosition, this.enemyPosition).normalize();
            direction.multiplyScalar(this.missileSpeed);
            missile.userData = {
                velocity: direction,
                isPlayer: false,
                life: 150,
                damage: this.isBossMode ? 40 : 30,
                isMissile: true,
                target: this.playerPosition.clone()
            };
        }

        this.scene.add(missile);
        this.missiles.push(missile);

        if (window.audioManager) {
            window.audioManager.playMissileLaunch();
        }

        if (isPlayer) {
            this.showMessage('导弹发射！', 800);
        }
    }

    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            const data = bullet.userData;
            bullet.position.add(data.velocity.clone().multiplyScalar(deltaTime));
            data.life -= deltaTime;

            if (data.life <= 0) {
                this.scene.remove(bullet);
                this.bullets.splice(i, 1);
                continue;
            }

            if (data.isPlayer) {
                const dist = bullet.position.distanceTo(this.enemyPosition);
                const hitRadius = this.isBossMode ? 5 : 2.5;
                if (dist < hitRadius) {
                    this.enemyHealth -= data.damage;
                    this.shotsHit++;
                    this.createExplosion(this.enemyPosition.clone(), false);
                    this.scene.remove(bullet);
                    this.bullets.splice(i, 1);

                    if (window.audioManager) {
                        window.audioManager.playHit();
                    }

                    if (this.enemyHealth <= 0) {
                        this.playerRoundScore++;
                        this.showMessage(this.isBossMode ? '首领被击败！' : '击中！', 1000);
                        this.enemyHealth = 0;
                    }

                    this.updateHUD();
                    continue;
                }
            } else {
                const dist = bullet.position.distanceTo(this.playerPosition);
                if (dist < 2.5) {
                    this.playerHealth -= data.damage;
                    this.createExplosion(this.playerPosition.clone(), false);
                    this.scene.remove(bullet);
                    this.bullets.splice(i, 1);

                    if (window.audioManager) {
                        window.audioManager.playHit();
                    }

                    if (this.playerHealth <= 0) {
                        this.enemyRoundScore++;
                        this.showMessage('被击中！', 1000);
                        this.playerHealth = 0;
                    }

                    this.updateHUD();
                    continue;
                }
            }

            if (Math.abs(bullet.position.x) > this.boundaryX + 5 ||
                Math.abs(bullet.position.y) > this.boundaryY + 5 ||
                Math.abs(bullet.position.z) > this.boundaryZ + 10) {
                this.scene.remove(bullet);
                this.bullets.splice(i, 1);
            }
        }
    }

    updateMissiles(deltaTime) {
        for (let i = this.missiles.length - 1; i >= 0; i--) {
            const missile = this.missiles[i];
            const data = missile.userData;

            if (data.isPlayer) {
                const targetDir = new THREE.Vector3();
                targetDir.subVectors(this.enemyPosition, missile.position).normalize();
                const currentDir = data.velocity.clone().normalize();
                const trackingStrength = this.missileTracking || 0.05;
                const newDir = currentDir.lerp(targetDir, trackingStrength).normalize();
                data.velocity = newDir.multiplyScalar(this.missileSpeed);
                missile.lookAt(this.enemyPosition);
            } else {
                const targetDir = new THREE.Vector3();
                targetDir.subVectors(this.playerPosition, missile.position).normalize();
                const currentDir = data.velocity.clone().normalize();
                const newDir = currentDir.lerp(targetDir, 0.04).normalize();
                data.velocity = newDir.multiplyScalar(this.missileSpeed);
                missile.lookAt(this.playerPosition);
            }

            missile.position.add(data.velocity.clone().multiplyScalar(deltaTime));
            data.life -= deltaTime;

            if (data.life <= 0) {
                this.scene.remove(missile);
                this.missiles.splice(i, 1);
                continue;
            }

            const explosionRadius = this.isBossMode ? 6 : 4;

            if (data.isPlayer) {
                const dist = missile.position.distanceTo(this.enemyPosition);
                if (dist < explosionRadius) {
                    this.enemyHealth -= data.damage;
                    this.missilesHit++;
                    this.createExplosion(this.enemyPosition.clone(), true);
                    this.scene.remove(missile);
                    this.missiles.splice(i, 1);

                    if (window.audioManager) {
                        window.audioManager.playExplosion();
                    }

                    this.showMessage('导弹命中！', 1200);

                    if (this.enemyHealth <= 0) {
                        this.playerRoundScore++;
                        this.enemyHealth = 0;
                    }

                    this.updateHUD();
                    continue;
                }
            } else {
                const dist = missile.position.distanceTo(this.playerPosition);
                if (dist < explosionRadius) {
                    this.playerHealth -= data.damage;
                    this.createExplosion(this.playerPosition.clone(), true);
                    this.scene.remove(missile);
                    this.missiles.splice(i, 1);

                    if (window.audioManager) {
                        window.audioManager.playExplosion();
                    }

                    this.showMessage('导弹来袭！', 1200);

                    if (this.playerHealth <= 0) {
                        this.enemyRoundScore++;
                        this.playerHealth = 0;
                    }

                    this.updateHUD();
                    continue;
                }
            }

            if (Math.abs(missile.position.x) > this.boundaryX + 10 ||
                Math.abs(missile.position.y) > this.boundaryY + 10 ||
                Math.abs(missile.position.z) > this.boundaryZ + 15) {
                this.scene.remove(missile);
                this.missiles.splice(i, 1);
            }
        }
    }

    createExplosion(position, isMissileExplosion) {
        let explosion;
        if (this.isBossMode && this.enemyHealth <= 0) {
            explosion = this.modelGenerator.createBossExplosion();
        } else if (isMissileExplosion) {
            explosion = this.modelGenerator.createMissileExplosion();
        } else {
            explosion = this.modelGenerator.createExplosion();
        }
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

            explosion.children.forEach(child => {
                if (child.userData.velocity) {
                    child.position.add(child.userData.velocity.clone().multiplyScalar(deltaTime * 0.1));
                    child.material.opacity = data.life * child.userData.life;
                }
            });

            const flash = explosion.children[explosion.children.length - 1];
            if (flash && flash.geometry.type === 'SphereGeometry') {
                flash.scale.setScalar(1 + (1 - data.life) * 2);
                flash.material.opacity = data.life * 0.8;
            }

            explosion.scale.setScalar(1 + (1 - data.life) * 0.5);
        }
    }

    updateCamera() {
        const targetPos = this.playerPosition.clone();
        const offset = new THREE.Vector3(0, 5, 15);
        const cameraPos = targetPos.clone().add(offset);
        this.camera.position.lerp(cameraPos, 0.05);
        const lookAt = this.playerPosition.clone();
        lookAt.z -= 10;
        this.camera.lookAt(lookAt);
    }

    checkRoundEnd() {
        if (this.playerRoundScore >= 3 || this.enemyRoundScore >= 3) {
            this.endRound();
        }

        if (this.playerHealth <= 0 && this.enemyHealth <= 0) {
            setTimeout(() => {
                if (this.gameState === 'playing') {
                    this.playerPosition.set(0, 0, this.initialDistance / 2);
                    this.enemyPosition.set(0, 2, -this.initialDistance / 2);
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

        this.updateHUD();

        setTimeout(() => {
            if (this.isBossMode && this.playerRoundScore >= 3) {
                this.showBossDefeat();
            } else {
                this.showRoundResult();
            }
        }, 1000);
    }

    showBossDefeat() {
        const bossDefeatScreen = document.getElementById('boss-defeat-screen');
        const defeatedBossName = document.getElementById('defeated-boss-name');

        if (defeatedBossName) {
            defeatedBossName.textContent = this.bossName;
        }

        if (bossDefeatScreen) {
            bossDefeatScreen.classList.add('active');
        }

        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.onclick = () => {
                if (bossDefeatScreen) {
                    bossDefeatScreen.classList.remove('active');
                }
                this.showGameOver();
            };
        }
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

        statHits.textContent = this.shotsHit + this.missilesHit;
        const totalShots = this.shotsFired + this.missilesFired;
        const accuracy = totalShots > 0 ? Math.round(((this.shotsHit + this.missilesHit) / totalShots) * 100) : 0;
        statAccuracy.textContent = accuracy + '%';
        statHealth.textContent = Math.max(0, Math.round(this.playerHealth)) + '%';

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
        if (roundScreen) roundScreen.classList.remove('active');

        const bossDefeatScreen = document.getElementById('boss-defeat-screen');
        if (bossDefeatScreen) bossDefeatScreen.classList.remove('active');

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
            gameoverMessage.textContent = this.isBossMode ? '恭喜！你击败了首领，成为真正的空战王者！' : '恭喜！你赢得了这场空战！';
        } else {
            gameoverMessage.textContent = '不要气馁，再来一局！';
        }

        gameoverScreen.classList.add('active');
    }

    updateHUD() {
        document.getElementById('player-score').textContent = this.playerRoundScore;
        document.getElementById('enemy-score').textContent = this.enemyRoundScore;
        document.getElementById('round-display').textContent = this.isBossMode ? 'BOSS战' : `第 ${this.round} 局`;
        document.getElementById('match-score').textContent = `${this.playerMatchScore} - ${this.enemyMatchScore}`;

        const healthPercent = Math.max(0, (this.playerHealth / this.playerMaxHealth) * 100);
        document.getElementById('player-health').style.width = healthPercent + '%';

        const missileCountEl = document.getElementById('missile-count');
        if (missileCountEl) {
            missileCountEl.textContent = this.missileCount;
        }
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
        this.clearScene();
        this.hideBossHUD();
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}
