// AI敌人控制器
class AIController {
    constructor() {
        this.shootCooldown = 0;
        this.shootCooldownMax = 40;
        this.missileCooldown = 0;
        this.missileCooldownMax = 200;
        this.moveTimer = 0;
        this.targetPosition = new THREE.Vector3();
        this.difficulty = 1.0;
        this.state = 'chase';
        this.stateTimer = 0;
        this.maneuverType = 'none';
        this.maneuverTimer = 0;
    }

    update(game, deltaTime) {
        if (game.gameState !== 'playing') return;

        const playerPos = game.playerPosition;
        const enemyPos = game.enemyPosition;
        const distance = enemyPos.distanceTo(playerPos);

        this.updateState(game, distance);

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

        this.updateManeuver(game, deltaTime);
        this.updateShooting(game, deltaTime, distance);
        this.checkBoundaries(game);
    }

    updateState(game, distance) {
        this.stateTimer--;

        if (this.stateTimer <= 0) {
            const healthPercent = game.enemyHealth / game.enemyMaxHealth;

            if (healthPercent < 0.3 && distance < 20) {
                this.state = 'retreat';
                this.stateTimer = 120 + Math.random() * 60;
            } else if (distance > 30) {
                this.state = 'chase';
                this.stateTimer = 60 + Math.random() * 40;
            } else if (distance < 10 && Math.random() < 0.4) {
                this.state = 'evade';
                this.stateTimer = 40 + Math.random() * 30;
            } else {
                this.state = 'attack';
                this.stateTimer = 80 + Math.random() * 40;
            }
        }

        // BOSS模式更强
        if (game.isBossMode) {
            this.difficulty = 1.5 + (game.round - 1) * 0.2;
        } else {
            this.difficulty = 0.8 + (game.round - 1) * 0.15;
        }
        if (this.difficulty > 2.0) this.difficulty = 2.0;
    }

    chaseBehavior(game, deltaTime, distance) {
        const direction = new THREE.Vector3();
        direction.subVectors(game.playerPosition, game.enemyPosition).normalize();

        const targetY = game.playerPosition.y + Math.sin(Date.now() * 0.001) * 3;

        game.enemyVelocity.x = direction.x * game.enemySpeed * this.difficulty * 0.8;
        game.enemyVelocity.y = (targetY - game.enemyPosition.y) * 0.02;
        game.enemyVelocity.z = direction.z * game.enemySpeed * this.difficulty * 0.5;

        if (Math.random() < 0.01) {
            this.startManeuver('zigzag');
        }
    }

    evadeBehavior(game, deltaTime, distance) {
        const direction = new THREE.Vector3();
        direction.subVectors(game.enemyPosition, game.playerPosition).normalize();

        direction.x += (Math.random() - 0.5) * 0.5;
        direction.y += (Math.random() - 0.5) * 0.5;
        direction.normalize();

        game.enemyVelocity.x = direction.x * game.enemySpeed * this.difficulty;
        game.enemyVelocity.y = direction.y * game.enemySpeed * this.difficulty;
        game.enemyVelocity.z = direction.z * game.enemySpeed * this.difficulty * 0.3;

        if (Math.random() < 0.02) {
            this.startManeuver('barrel');
        }
    }

    attackBehavior(game, deltaTime, distance) {
        const direction = new THREE.Vector3();
        direction.subVectors(game.playerPosition, game.enemyPosition).normalize();

        const prediction = game.playerVelocity.clone().multiplyScalar(10);
        const targetPos = game.playerPosition.clone().add(prediction);

        const attackDir = new THREE.Vector3();
        attackDir.subVectors(targetPos, game.enemyPosition).normalize();

        let speed = game.enemySpeed * this.difficulty;
        if (distance < 15) speed *= 0.6;

        game.enemyVelocity.x = attackDir.x * speed;
        game.enemyVelocity.y = attackDir.y * speed;
        game.enemyVelocity.z = attackDir.z * speed * 0.3;

        if (Math.random() < 0.015) {
            this.startManeuver('climb');
        }
    }

    retreatBehavior(game, deltaTime, distance) {
        const direction = new THREE.Vector3();
        direction.subVectors(game.enemyPosition, game.playerPosition).normalize();

        direction.y += 0.3;
        direction.normalize();

        game.enemyVelocity.x = direction.x * game.enemySpeed * this.difficulty * 1.2;
        game.enemyVelocity.y = direction.y * game.enemySpeed * this.difficulty * 1.2;
        game.enemyVelocity.z = direction.z * game.enemySpeed * this.difficulty * 0.5;

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
                game.enemyFighter.rotation.x += 0.15 * deltaTime;
                game.enemyVelocity.y += Math.sin(Date.now() * 0.01) * 0.02;
                break;
            case 'zigzag':
                game.enemyVelocity.x += Math.sin(Date.now() * 0.008) * 0.03 * this.difficulty;
                break;
            case 'climb':
                game.enemyVelocity.y += 0.02 * this.difficulty;
                game.enemyFighter.rotation.x -= 0.05 * deltaTime;
                break;
        }
    }

    updateShooting(game, deltaTime, distance) {
        this.shootCooldown -= deltaTime;
        this.missileCooldown -= deltaTime;

        if (this.shootCooldown <= 0) {
            if (distance > 35) return;
            if (distance < 5) return;

            const direction = new THREE.Vector3();
            direction.subVectors(game.playerPosition, game.enemyPosition).normalize();

            const timeToHit = distance / (game.bulletSpeed * 0.8);
            const predictedPos = game.playerPosition.clone().add(
                game.playerVelocity.clone().multiplyScalar(timeToHit * 0.5)
            );

            const aimDirection = new THREE.Vector3();
            aimDirection.subVectors(predictedPos, game.enemyPosition).normalize();

            const angle = direction.angleTo(aimDirection);
            const maxAngle = 0.3 / this.difficulty;

            if (angle < maxAngle && Math.random() < 0.7 * this.difficulty) {
                game.fireBullet(false);
                this.shootCooldown = this.shootCooldownMax / this.difficulty;
            }
        }

        // BOSS模式发射更多导弹
        if (this.missileCooldown <= 0 && distance > 15 && distance < 40) {
            const missileChance = game.isBossMode ? 0.3 * this.difficulty : 0.1 * this.difficulty;
            if (Math.random() < missileChance) {
                game.fireMissile(false);
                this.missileCooldown = this.missileCooldownMax / this.difficulty;
            }
        }
    }

    checkBoundaries(game) {
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
