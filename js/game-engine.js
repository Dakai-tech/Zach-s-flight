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
        this.enemyPosition = new THREE.Vector3(0, 0, 0);
        this.enemyVelocity = new THREE.Vector3(0, 0, 0);
        this.enemySpeed = 0.35;

        // 武器系统
        this.bullets = [];
        this.missiles = [];
        this.bulletSpeed = 1.2;
        this.missileSpeed = 0.8;
        this.bulletCooldown = 0;
        this.bulletCooldownMax = 8;
        this.missileCooldown = 0;
        this.missileCooldownMax = 120; // 导弹冷却更长
        this.missileCount = 3; // 每局导弹数量

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

        // 初始距离 - 双方相对起飞
        this.initialDistance = 50; // 更远的初始距离

        this.init();
    }

    init() {
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 30, 100);

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            200
        );
        this.camera.position.set(0, 4, 12);

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
            if (e.code === 'Space' || e.code === 'Enter') {
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
        const missileBtn = document.getElementById('missile-btn');

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

        // 导弹按钮
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

        // 双方相对起飞 - 玩家在南，敌人在北，面对面
        this.playerPosition.set(0, 0, this.initialDistance / 2);  // 玩家在后半区
        this.enemyPosition.set(0, 2, -this.initialDistance / 2); // 敌人在前半区

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
        this.missileCount = 3; // 每局3枚导弹

        // 清除旧战机
        if (this.playerFighter) {
            this.scene.remove(this.playerFighter);
        }
        if (this.enemyFighter) {
            this.scene.remove(this.enemyFighter);
        }

        // 创建玩家战机 - 面向北方（朝向敌人）
        this.playerFighter = this.modelGenerator.getFighter(this.playerFighterType);
        this.playerFighter.position.copy(this.playerPosition);
        this.playerFighter.rotation.y = Math.PI; // 旋转180度，面向北方（-Z方向）
        this.playerFighter.castShadow = true;
        this.scene.add(this.playerFighter);

        // 创建敌方战机 - 面向南方（朝向玩家）
        this.enemyFighter = this.modelGenerator.getFighter(this.enemyFighterType);
        this.enemyFighter.position.copy(this.enemyPosition);
        this.enemyFighter.rotation.y = 0; // 面向南方（+Z方向）
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

        // 更新导弹
        this.updateMissiles(deltaTime);

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

        // 键盘输入 - 相对飞机朝向的控制
        // 玩家面向北方（-Z），所以控制逻辑需要调整
        if (this.keys['ArrowUp'] || this.keys['KeyW']) moveY += speed; // 向上飞
        if (this.keys['ArrowDown'] || this.keys['KeyS']) moveY -= speed; // 向下飞
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) moveX -= speed; // 向左
        if (this.keys['ArrowRight'] || this.keys['KeyD']) moveX += speed; // 向右

        // 触摸输入
        if (this.touchJoystick.active) {
            moveX += this.touchJoystick.x * speed * 1.5;
            moveY -= this.touchJoystick.y * speed * 1.5; // 触摸Y轴反向
        }

        // 应用移动
        this.playerVelocity.x = moveX;
        this.playerVelocity.y = moveY;

        // 射击 - 机炮（空格键）
        this.bulletCooldown -= deltaTime;
        const shouldFire = this.keys['Space'] || this.touchFire;

        if (shouldFire && this.bulletCooldown <= 0) {
            this.fireBullet(true);
            this.bulletCooldown = this.bulletCooldownMax;
            this.shotsFired++;
        }

        // 发射导弹（回车键）
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
        // 应用速度
        this.playerPosition.x += this.playerVelocity.x;
        this.playerPosition.y += this.playerVelocity.y;

        // 保持面向北方的基本朝向，但可以有轻微偏转
        // 边界限制
        this.playerPosition.x = Math.max(-this.boundaryX, Math.min(this.boundaryX, this.playerPosition.x));
        this.playerPosition.y = Math.max(-this.boundaryY, Math.min(this.boundaryY, this.playerPosition.y));
        this.playerPosition.z = Math.max(-this.boundaryZ, Math.min(this.boundaryZ, this.playerPosition.z));

        // 更新战机位置和旋转
        if (this.playerFighter) {
            this.playerFighter.position.copy(this.playerPosition);

            // 基础朝向北方（Math.PI），根据移动做倾斜
            const baseRotation = Math.PI;
            const tiltX = this.playerVelocity.y * 0.5; // 上下移动时俯仰
            const tiltZ = -this.playerVelocity.x * 0.3; // 左右移动时滚转

            this.playerFighter.rotation.x = tiltX;
            this.playerFighter.rotation.y = baseRotation + this.playerVelocity.x * 0.1; // 轻微偏航
            this.playerFighter.rotation.z = tiltZ;
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
        this.enemyPosition.z = Math.max(-this.boundaryZ, Math.min(this.boundaryZ, this.enemyPosition.z));

        // 更新战机位置和旋转
        if (this.enemyFighter) {
            this.enemyFighter.position.copy(this.enemyPosition);

            // 敌人面向南方（朝向玩家），基础朝向为0
            const baseRotation = 0;

            // 面向玩家方向（带预测）
            const direction = new THREE.Vector3();
            direction.subVectors(this.playerPosition, this.enemyPosition).normalize();
            const targetRotation = Math.atan2(direction.x, direction.z);

            // 平滑转向，但保持面向南方的大致方向
            this.enemyFighter.rotation.y += (targetRotation - this.enemyFighter.rotation.y) * 0.05;

            // 倾斜
            this.enemyFighter.rotation.x = this.enemyVelocity.y * 0.5;
            this.enemyFighter.rotation.z = -this.enemyVelocity.x * 0.3;
        }
    }

    fireBullet(isPlayer) {
        const bullet = this.modelGenerator.createBullet();

        if (isPlayer) {
            // 玩家子弹 - 向北方（-Z方向）发射
            bullet.position.copy(this.playerPosition);
            bullet.position.z -= 2; // 从机头前方发射
            bullet.userData = {
                velocity: new THREE.Vector3(0, 0, -this.bulletSpeed),
                isPlayer: true,
                life: 60,
                damage: 10
            };

            // 添加尾焰
            const trail = this.modelGenerator.createEngineTrail();
            trail.position.copy(bullet.position);
            trail.scale.set(0.3, 0.3, 0.3);
            bullet.add(trail);
        } else {
            // 敌人子弹 - 向南方（+Z方向）发射
            bullet.position.copy(this.enemyPosition);
            bullet.position.z += 2; // 从机头前方发射

            // 瞄准玩家
            const direction = new THREE.Vector3();
            direction.subVectors(this.playerPosition, this.enemyPosition).normalize();
            direction.multiplyScalar(this.bulletSpeed * 0.8);

            bullet.userData = {
                velocity: direction,
                isPlayer: false,
                life: 80,
                damage: 10
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

    fireMissile(isPlayer) {
        const missile = this.modelGenerator.createMissile();

        if (isPlayer) {
            // 玩家导弹 - 向北方发射，带追踪
            missile.position.copy(this.playerPosition);
            missile.position.z -= 2.5;
            missile.userData = {
                velocity: new THREE.Vector3(0, 0, -this.missileSpeed),
                isPlayer: true,
                life: 150,
                damage: 30, // 导弹伤害更高
                isMissile: true,
                target: this.enemyPosition.clone()
            };
        } else {
            // 敌人导弹
            missile.position.copy(this.enemyPosition);
            missile.position.z += 2.5;

            const direction = new THREE.Vector3();
            direction.subVectors(this.playerPosition, this.enemyPosition).normalize();
            direction.multiplyScalar(this.missileSpeed);

            missile.userData = {
                velocity: direction,
                isPlayer: false,
                life: 150,
                damage: 30,
                isMissile: true,
                target: this.playerPosition.clone()
            };
        }

        this.scene.add(missile);
        this.missiles.push(missile);

        // 播放导弹发射音效
        if (window.audioManager) {
            window.audioManager.playMissileLaunch();
        }

        // 显示导弹发射消息
        if (isPlayer) {
            this.showMessage('导弹发射！', 800);
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
                    this.enemyHealth -= data.damage;
                    this.shotsHit++;
                    this.createExplosion(this.enemyPosition.clone(), false);
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
                    this.playerHealth -= data.damage;
                    this.createExplosion(this.playerPosition.clone(), false);
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

    updateMissiles(deltaTime) {
        for (let i = this.missiles.length - 1; i >= 0; i--) {
            const missile = this.missiles[i];
            const data = missile.userData;

            // 导弹追踪逻辑
            if (data.isPlayer) {
                // 玩家导弹追踪敌人
                const targetDir = new THREE.Vector3();
                targetDir.subVectors(this.enemyPosition, missile.position).normalize();

                // 平滑转向目标
                const currentDir = data.velocity.clone().normalize();
                const newDir = currentDir.lerp(targetDir, 0.05).normalize();
                data.velocity = newDir.multiplyScalar(this.missileSpeed);

                // 更新导弹朝向
                missile.lookAt(this.enemyPosition);
            } else {
                // 敌人导弹追踪玩家
                const targetDir = new THREE.Vector3();
                targetDir.subVectors(this.playerPosition, missile.position).normalize();

                const currentDir = data.velocity.clone().normalize();
                const newDir = currentDir.lerp(targetDir, 0.04).normalize();
                data.velocity = newDir.multiplyScalar(this.missileSpeed);

                missile.lookAt(this.playerPosition);
            }

            // 移动导弹
            missile.position.add(data.velocity.clone().multiplyScalar(deltaTime));
            data.life -= deltaTime;

            // 检查生命周期
            if (data.life <= 0) {
                this.scene.remove(missile);
                this.missiles.splice(i, 1);
                continue;
            }

            // 碰撞检测 - 导弹爆炸范围更大
            const explosionRadius = 4.0;

            if (data.isPlayer) {
                const dist = missile.position.distanceTo(this.enemyPosition);
                if (dist < explosionRadius) {
                    this.enemyHealth -= data.damage;
                    this.missilesHit++;
                    this.createExplosion(this.enemyPosition.clone(), true); // 导弹大爆炸
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

            // 边界检查
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
        if (isMissileExplosion) {
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
        // 相机跟随玩家，从后方和上方看
        const targetPos = this.playerPosition.clone();

        // 相机在玩家后方（南方）偏上
        const offset = new THREE.Vector3(0, 5, 15);
        const cameraPos = targetPos.clone().add(offset);

        this.camera.position.lerp(cameraPos, 0.05);

        // 看向玩家前方（北方）
        const lookAt = this.playerPosition.clone();
        lookAt.z -= 10; // 看向北方
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

        statHits.textContent = this.shotsHit + this.missilesHit;
        const totalShots = this.shotsFired + this.missilesFired;
        const accuracy = totalShots > 0 ? Math.round(((this.shotsHit + this.missilesHit) / totalShots) * 100) : 0;
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

        // 更新导弹数量显示
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

        // 清除所有子弹
        this.bullets.forEach(bullet => this.scene.remove(bullet));
        this.bullets = [];

        // 清除所有导弹
        this.missiles.forEach(missile => this.scene.remove(missile));
        this.missiles = [];

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
