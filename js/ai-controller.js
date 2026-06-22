// AI敌人控制器
class AIController {
    constructor() {
        this.shootCooldown = 0;
        this.shootCooldownMax = 40;
        this.moveTimer = 0;
        this.targetPosition = new THREE.Vector3();
        this.difficulty = 1.0; // 难度系数

        // AI状态
        this.state = 'chase'; // chase, evade, attack, retreat
        this.stateTimer = 0;

        // 战术机动
        this.maneuverType = 'none'; // none, barrel, zigzag, climb
        this.maneuverTimer = 0;
    }

    update(game, deltaTime) {
        if (game.gameState !== 'playing') return;

        const playerPos = game.playerPosition;
        const enemyPos = game.enemyPosition;
        const distance = enemyPos.distanceTo(playerPos);

        // 更新状态机
        this.updateState(game, distance);

        // 根据状态执行行为
        switch(this.state) {
            case 'chase':
                this.chaseBehavior(game, deltaTime, distance);
                break;
            case 'evade':
                this.evadeBehavior(game, deltaTime, distance);
                break;
            case 'attack':
                this.attackBehavior(game, deltaTime, distance);
                break;
            case 'retreat':
                this.retreatBehavior(game, deltaTime, distance);
                break;
        }

        // 执行战术机动
        this.updateManeuver(game, deltaTime);

        // 射击逻辑
        this.updateShooting(game, deltaTime, distance);

        // 边界检查
        this.checkBoundaries(game);
    }

    updateState(game, distance) {
        this.stateTimer--;

        if (this.stateTimer <= 0) {
            // 根据情况选择新状态
            const healthPercent = game.enemyHealth / game.enemyMaxHealth;

            if (healthPercent < 0.3 && distance < 15) {
                // 生命值低，撤退
                this.state = 'retreat';
                this.stateTimer = 120 + Math.random() * 60;
            } else if (distance > 20) {
                // 距离太远，追击
                this.state = 'chase';
                this.stateTimer = 60 + Math.random() * 40;
            } else if (distance < 8 && Math.random() < 0.4) {
                // 距离太近，躲避
                this.state = 'evade';
                this.stateTimer = 40 + Math.random() * 30;
            } else {
                // 攻击
                this.state = 'attack';
                this.stateTimer = 80 + Math.random() * 40;
            }
        }

        // 根据难度调整
        this.difficulty = 0.8 + (game.round - 1) * 0.15;
        if (this.difficulty > 1.5) this.difficulty = 1.5;
    }

    chaseBehavior(game, deltaTime, distance) {
        // 向玩家移动
        const direction = new THREE.Vector3();
        direction.subVectors(game.playerPosition, game.enemyPosition).normalize();

        // 保持一定高度差
        const targetY = game.playerPosition.y + Math.sin(Date.now() * 0.001) * 3;

        game.enemyVelocity.x = direction.x * game.enemySpeed * this.difficulty * 0.8;
        game.enemyVelocity.y = (targetY - game.enemyPosition.y) * 0.02;
        game.enemyVelocity.z = direction.z * game.enemySpeed * this.difficulty * 0.5;

        // 随机开始机动
        if (Math.random() < 0.01) {
            this.startManeuver('zigzag');
        }
    }

    evadeBehavior(game, deltaTime, distance) {
        // 远离玩家
        const direction = new THREE.Vector3();
        direction.subVectors(game.enemyPosition, game.playerPosition).normalize();

        // 添加随机偏移
        direction.x += (Math.random() - 0.5) * 0.5;
        direction.y += (Math.random() - 0.5) * 0.5;
        direction.normalize();

        game.enemyVelocity.x = direction.x * game.enemySpeed * this.difficulty;
        game.enemyVelocity.y = direction.y * game.enemySpeed * this.difficulty;
        game.enemyVelocity.z = direction.z * game.enemySpeed * this.difficulty * 0.3;

        // 执行桶滚机动
        if (Math.random() < 0.02) {
            this.startManeuver('barrel');
        }
    }

    attackBehavior(game, deltaTime, distance) {
        // 瞄准玩家
        const direction = new THREE.Vector3();
        direction.subVectors(game.playerPosition, game.enemyPosition).normalize();

        // 预测玩家移动
        const prediction = game.playerVelocity.clone().multiplyScalar(10);
        const targetPos = game.playerPosition.clone().add(prediction);

        const attackDir = new THREE.Vector3();
        attackDir.subVectors(targetPos, game.enemyPosition).normalize();

        // 保持最佳攻击距离
        let speed = game.enemySpeed * this.difficulty;
        if (distance < 10) speed *= 0.6; // 减速保持位置

        game.enemyVelocity.x = attackDir.x * speed;
        game.enemyVelocity.y = attackDir.y * speed;
        game.enemyVelocity.z = attackDir.z * speed * 0.3;

        // 随机机动
        if (Math.random() < 0.015) {
            this.startManeuver('climb');
        }
    }

    retreatBehavior(game, deltaTime, distance) {
        // 远离玩家，恢复生命值（模拟）
        const direction = new THREE.Vector3();
        direction.subVectors(game.enemyPosition, game.playerPosition).normalize();

        // 向后上方撤退
        direction.y += 0.3;
        direction.normalize();

        game.enemyVelocity.x = direction.x * game.enemySpeed * this.difficulty * 1.2;
        game.enemyVelocity.y = direction.y * game.enemySpeed * this.difficulty * 1.2;
        game.enemyVelocity.z = direction.z * game.enemySpeed * this.difficulty * 0.5;

        // 缓慢恢复生命值
        if (game.enemyHealth < game.enemyMaxHealth) {
            game.enemyHealth += 0.05;
        }
    }

    startManeuver(type) {
        this.maneuverType = type;
        this.maneuverTimer = 30 + Math.random() * 20;
    }

    updateManeuver(game, deltaTime) {
        if (this.maneuverTimer <= 0) {
            this.maneuverType = 'none';
            return;
        }

        this.maneuverTimer -= deltaTime;

        switch(this.maneuverType) {
            case 'barrel':
                // 桶滚机动
                game.enemyFighter.rotation.x += 0.15 * deltaTime;
                game.enemyVelocity.y += Math.sin(Date.now() * 0.01) * 0.02;
                break;

            case 'zigzag':
                // 之字形机动
                game.enemyVelocity.x += Math.sin(Date.now() * 0.008) * 0.03 * this.difficulty;
                break;

            case 'climb':
                // 爬升机动
                game.enemyVelocity.y += 0.02 * this.difficulty;
                game.enemyFighter.rotation.x -= 0.05 * deltaTime;
                break;
        }
    }

    updateShooting(game, deltaTime, distance) {
        this.shootCooldown -= deltaTime;

        if (this.shootCooldown > 0) return;

        // 检查是否可以射击
        if (distance > 25) return; // 太远不射击
        if (distance < 3) return; // 太近不射击（避免自伤）

        // 计算瞄准精度
        const direction = new THREE.Vector3();
        direction.subVectors(game.playerPosition, game.enemyPosition).normalize();

        // 预测玩家位置
        const timeToHit = distance / (game.bulletSpeed * 0.8);
        const predictedPos = game.playerPosition.clone().add(
            game.playerVelocity.clone().multiplyScalar(timeToHit * 0.5)
        );

        const aimDirection = new THREE.Vector3();
        aimDirection.subVectors(predictedPos, game.enemyPosition).normalize();

        // 检查瞄准角度
        const angle = direction.angleTo(aimDirection);
        const maxAngle = 0.3 / this.difficulty; // 难度越高，瞄准越准

        if (angle < maxAngle && Math.random() < 0.7 * this.difficulty) {
            game.fireBullet(false);
            this.shootCooldown = this.shootCooldownMax / this.difficulty;
        }
    }

    checkBoundaries(game) {
        // 确保AI不会飞出边界太远
        const margin = 5;

        if (game.enemyPosition.x > game.boundaryX - margin) {
            game.enemyVelocity.x -= 0.02;
        }
        if (game.enemyPosition.x < -game.boundaryX + margin) {
            game.enemyVelocity.x += 0.02;
        }
        if (game.enemyPosition.y > game.boundaryY - margin) {
            game.enemyVelocity.y -= 0.02;
        }
        if (game.enemyPosition.y < -game.boundaryY + margin) {
            game.enemyVelocity.y += 0.02;
        }
        if (game.enemyPosition.z > game.boundaryZ - margin) {
            game.enemyVelocity.z -= 0.02;
        }
        if (game.enemyPosition.z < -game.boundaryZ - 10) {
            game.enemyVelocity.z += 0.02;
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIController;
}
