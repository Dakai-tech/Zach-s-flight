// 战机3D模型生成器
class FighterModelGenerator {
    constructor() {
        this.models = {};
    }

    // 创建歼-20模型（中国）- 鸭式布局，双发，DSI进气道
    createJ20() {
        const group = new THREE.Group();

        // 机身主体 - 扁平菱形截面
        const fuselageGeom = new THREE.BoxGeometry(0.8, 0.4, 4.5);
        const fuselageMat = new THREE.MeshPhongMaterial({ 
            color: 0x2a3f5f, 
            shininess: 80,
            specular: 0x444444
        });
        const fuselage = new THREE.Mesh(fuselageGeom, fuselageMat);
        fuselage.position.y = 0.2;
        group.add(fuselage);

        // 机头 - 尖锐
        const noseGeom = new THREE.ConeGeometry(0.3, 1.5, 4);
        const nose = new THREE.Mesh(noseGeom, fuselageMat);
        nose.rotation.x = Math.PI / 2;
        nose.rotation.y = Math.PI / 4;
        nose.position.set(0, 0.2, 2.8);
        group.add(nose);

        // DSI进气道鼓包
        const intakeGeom = new THREE.SphereGeometry(0.25, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const intakeMat = new THREE.MeshPhongMaterial({ color: 0x1a1a2e });

        const leftIntake = new THREE.Mesh(intakeGeom, intakeMat);
        leftIntake.position.set(-0.5, 0.1, 0.5);
        leftIntake.scale.set(1, 0.6, 1.5);
        group.add(leftIntake);

        const rightIntake = leftIntake.clone();
        rightIntake.position.set(0.5, 0.1, 0.5);
        group.add(rightIntake);

        // 鸭翼（前翼）- 歼-20特征
        const canardGeom = new THREE.BoxGeometry(1.2, 0.05, 0.6);
        const wingMat = new THREE.MeshPhongMaterial({ 
            color: 0x2a3f5f, 
            shininess: 60 
        });

        const leftCanard = new THREE.Mesh(canardGeom, wingMat);
        leftCanard.position.set(-0.6, 0.35, 1.2);
        leftCanard.rotation.z = 0.1;
        leftCanard.rotation.y = -0.1;
        group.add(leftCanard);

        const rightCanard = leftCanard.clone();
        rightCanard.position.set(0.6, 0.35, 1.2);
        rightCanard.rotation.z = -0.1;
        rightCanard.rotation.y = 0.1;
        group.add(rightCanard);

        // 主翼 - 大后掠三角翼
        const mainWingGeom = new THREE.BoxGeometry(3.5, 0.05, 1.8);
        const mainWing = new THREE.Mesh(mainWingGeom, wingMat);
        mainWing.position.set(0, 0.25, -0.3);
        mainWing.rotation.x = 0.05;
        group.add(mainWing);

        // 翼尖折线
        const wingTipGeom = new THREE.BoxGeometry(0.8, 0.05, 0.8);
        const leftWingTip = new THREE.Mesh(wingTipGeom, wingMat);
        leftWingTip.position.set(-1.8, 0.28, -0.1);
        leftWingTip.rotation.y = -0.3;
        group.add(leftWingTip);

        const rightWingTip = leftWingTip.clone();
        rightWingTip.position.set(1.8, 0.28, -0.1);
        rightWingTip.rotation.y = 0.3;
        group.add(rightWingTip);

        // 全动垂尾 - 外倾
        const tailGeom = new THREE.BoxGeometry(0.15, 1.2, 0.8);
        const tailMat = new THREE.MeshPhongMaterial({ color: 0x2a3f5f });

        const leftTail = new THREE.Mesh(tailGeom, tailMat);
        leftTail.position.set(-0.6, 0.8, -1.8);
        leftTail.rotation.z = 0.25;
        leftTail.rotation.y = 0.15;
        group.add(leftTail);

        const rightTail = leftTail.clone();
        rightTail.position.set(0.6, 0.8, -1.8);
        rightTail.rotation.z = -0.25;
        rightTail.rotation.y = -0.15;
        group.add(rightTail);

        // 腹鳍
        const ventralGeom = new THREE.BoxGeometry(0.1, 0.6, 0.5);
        const leftVentral = new THREE.Mesh(ventralGeom, tailMat);
        leftVentral.position.set(-0.3, -0.1, -1.5);
        leftVentral.rotation.z = 0.2;
        group.add(leftVentral);

        const rightVentral = leftVentral.clone();
        rightVentral.position.set(0.3, -0.1, -1.5);
        rightVentral.rotation.z = -0.2;
        group.add(rightVentral);

        // 发动机喷口
        const nozzleGeom = new THREE.CylinderGeometry(0.2, 0.15, 0.4, 8);
        const nozzleMat = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            emissive: 0xff4400,
            emissiveIntensity: 0.3
        });

        const leftNozzle = new THREE.Mesh(nozzleGeom, nozzleMat);
        leftNozzle.rotation.x = Math.PI / 2;
        leftNozzle.position.set(-0.25, 0.2, -2.4);
        group.add(leftNozzle);

        const rightNozzle = leftNozzle.clone();
        rightNozzle.position.set(0.25, 0.2, -2.4);
        group.add(rightNozzle);

        // 座舱盖
        const cockpitGeom = new THREE.BoxGeometry(0.5, 0.25, 1.0);
        const cockpitMat = new THREE.MeshPhongMaterial({ 
            color: 0x88ccff, 
            transparent: true, 
            opacity: 0.7,
            shininess: 100
        });
        const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
        cockpit.position.set(0, 0.55, 1.0);
        group.add(cockpit);

        // 起落架舱门线条
        const gearLineGeom = new THREE.BoxGeometry(0.6, 0.02, 0.8);
        const gearLineMat = new THREE.MeshPhongMaterial({ color: 0x1a1a2e });
        const leftGear = new THREE.Mesh(gearLineGeom, gearLineMat);
        leftGear.position.set(-0.4, 0.01, -0.5);
        group.add(leftGear);

        const rightGear = leftGear.clone();
        rightGear.position.set(0.4, 0.01, -0.5);
        group.add(rightGear);

        // 中国空军标志（简化星形）
        const starShape = new THREE.Shape();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * 0.15;
            const y = Math.sin(angle) * 0.15;
            if (i === 0) starShape.moveTo(x, y);
            else starShape.lineTo(x, y);
        }
        starShape.closePath();

        const starGeom = new THREE.ShapeGeometry(starShape);
        const starMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        const star = new THREE.Mesh(starGeom, starMat);
        star.position.set(0, 0.41, 0.5);
        star.rotation.x = -Math.PI / 2;
        group.add(star);

        group.userData = { type: 'j20', name: '歼-20', country: 'china' };
        return group;
    }

    // F-22 猛禽（美国）
    createF22() {
        const group = new THREE.Group();

        // 机身 - 更粗壮
        const fuselageGeom = new THREE.BoxGeometry(0.9, 0.5, 4.2);
        const fuselageMat = new THREE.MeshPhongMaterial({ 
            color: 0x4a5568, 
            shininess: 70 
        });
        const fuselage = new THREE.Mesh(fuselageGeom, fuselageMat);
        fuselage.position.y = 0.25;
        group.add(fuselage);

        // 机头
        const noseGeom = new THREE.ConeGeometry(0.35, 1.4, 6);
        const nose = new THREE.Mesh(noseGeom, fuselageMat);
        nose.rotation.x = Math.PI / 2;
        nose.position.set(0, 0.25, 2.7);
        group.add(nose);

        // 梯形主翼
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(2.0, -0.3);
        wingShape.lineTo(2.0, -1.2);
        wingShape.lineTo(0.3, -1.0);
        wingShape.lineTo(0, 0);

        const wingGeom = new THREE.ExtrudeGeometry(wingShape, { depth: 0.06, bevelEnabled: false });
        const wingMat = new THREE.MeshPhongMaterial({ color: 0x4a5568 });

        const leftWing = new THREE.Mesh(wingGeom, wingMat);
        leftWing.position.set(0, 0.25, -0.2);
        leftWing.rotation.y = Math.PI;
        group.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeom, wingMat);
        rightWing.position.set(0, 0.25, -0.2);
        group.add(rightWing);

        // 水平尾翼
        const hTailGeom = new THREE.BoxGeometry(1.6, 0.05, 0.6);
        const hTail = new THREE.Mesh(hTailGeom, wingMat);
        hTail.position.set(0, 0.3, -1.8);
        group.add(hTail);

        // 倾斜双垂尾
        const vTailGeom = new THREE.BoxGeometry(0.12, 1.0, 0.7);
        const vTailMat = new THREE.MeshPhongMaterial({ color: 0x4a5568 });

        const leftVTail = new THREE.Mesh(vTailGeom, vTailMat);
        leftVTail.position.set(-0.5, 0.9, -1.6);
        leftVTail.rotation.z = 0.3;
        group.add(leftVTail);

        const rightVTail = leftVTail.clone();
        rightVTail.position.set(0.5, 0.9, -1.6);
        rightVTail.rotation.z = -0.3;
        group.add(rightVTail);

        // 加莱特进气道
        const intakeGeom = new THREE.BoxGeometry(0.4, 0.3, 1.0);
        const intakeMat = new THREE.MeshPhongMaterial({ color: 0x2d3748 });

        const leftIntake = new THREE.Mesh(intakeGeom, intakeMat);
        leftIntake.position.set(-0.5, 0.15, 0.8);
        leftIntake.rotation.y = 0.1;
        group.add(leftIntake);

        const rightIntake = leftIntake.clone();
        rightIntake.position.set(0.5, 0.15, 0.8);
        rightIntake.rotation.y = -0.1;
        group.add(rightIntake);

        // 喷口
        const nozzleGeom = new THREE.CylinderGeometry(0.22, 0.18, 0.35, 8);
        const nozzleMat = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            emissive: 0xff6600,
            emissiveIntensity: 0.2
        });

        const leftNozzle = new THREE.Mesh(nozzleGeom, nozzleMat);
        leftNozzle.rotation.x = Math.PI / 2;
        leftNozzle.position.set(-0.28, 0.25, -2.3);
        group.add(leftNozzle);

        const rightNozzle = leftNozzle.clone();
        rightNozzle.position.set(0.28, 0.25, -2.3);
        group.add(rightNozzle);

        // 座舱
        const cockpitGeom = new THREE.BoxGeometry(0.55, 0.3, 1.1);
        const cockpitMat = new THREE.MeshPhongMaterial({ 
            color: 0x99bbdd, 
            transparent: true, 
            opacity: 0.65 
        });
        const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
        cockpit.position.set(0, 0.6, 0.9);
        group.add(cockpit);

        // 美国标志（简化）
        const circleGeom = new THREE.CircleGeometry(0.12, 16);
        const circleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const star = new THREE.Mesh(circleGeom, circleMat);
        star.position.set(0, 0.51, 0.3);
        star.rotation.x = -Math.PI / 2;
        group.add(star);

        const innerCircle = new THREE.Mesh(
            new THREE.CircleGeometry(0.08, 16),
            new THREE.MeshBasicMaterial({ color: 0x0000ff })
        );
        innerCircle.position.set(0, 0.52, 0.3);
        innerCircle.rotation.x = -Math.PI / 2;
        group.add(innerCircle);

        group.userData = { type: 'f22', name: 'F-22', country: 'usa' };
        return group;
    }

    // F-2（日本）
    createF2() {
        const group = new THREE.Group();

        // 机身
        const fuselageGeom = new THREE.BoxGeometry(0.7, 0.4, 4.0);
        const fuselageMat = new THREE.MeshPhongMaterial({ color: 0x5a6a7a });
        const fuselage = new THREE.Mesh(fuselageGeom, fuselageMat);
        fuselage.position.y = 0.2;
        group.add(fuselage);

        // 机头
        const noseGeom = new THREE.ConeGeometry(0.28, 1.3, 5);
        const nose = new THREE.Mesh(noseGeom, fuselageMat);
        nose.rotation.x = Math.PI / 2;
        nose.position.set(0, 0.2, 2.5);
        group.add(nose);

        // 主翼 - 类似F-16的大面积翼
        const wingGeom = new THREE.BoxGeometry(2.8, 0.05, 1.6);
        const wingMat = new THREE.MeshPhongMaterial({ color: 0x5a6a7a });
        const mainWing = new THREE.Mesh(wingGeom, wingMat);
        mainWing.position.set(0, 0.22, -0.2);
        group.add(mainWing);

        // 水平尾翼
        const hTailGeom = new THREE.BoxGeometry(1.4, 0.05, 0.5);
        const hTail = new THREE.Mesh(hTailGeom, wingMat);
        hTail.position.set(0, 0.28, -1.6);
        group.add(hTail);

        // 单垂尾
        const vTailGeom = new THREE.BoxGeometry(0.12, 0.9, 0.6);
        const vTail = new THREE.Mesh(vTailGeom, wingMat);
        vTail.position.set(0, 0.75, -1.5);
        group.add(vTail);

        // 进气道
        const intakeGeom = new THREE.BoxGeometry(0.35, 0.25, 0.8);
        const intakeMat = new THREE.MeshPhongMaterial({ color: 0x3a4a5a });

        const leftIntake = new THREE.Mesh(intakeGeom, intakeMat);
        leftIntake.position.set(-0.4, 0.12, 0.6);
        group.add(leftIntake);

        const rightIntake = leftIntake.clone();
        rightIntake.position.set(0.4, 0.12, 0.6);
        group.add(rightIntake);

        // 单发喷口
        const nozzleGeom = new THREE.CylinderGeometry(0.2, 0.16, 0.3, 8);
        const nozzleMat = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            emissive: 0xff5500,
            emissiveIntensity: 0.25
        });
        const nozzle = new THREE.Mesh(nozzleGeom, nozzleMat);
        nozzle.rotation.x = Math.PI / 2;
        nozzle.position.set(0, 0.2, -2.2);
        group.add(nozzle);

        // 座舱
        const cockpitGeom = new THREE.BoxGeometry(0.45, 0.22, 0.9);
        const cockpitMat = new THREE.MeshPhongMaterial({ 
            color: 0x88bbdd, 
            transparent: true, 
            opacity: 0.7 
        });
        const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
        cockpit.position.set(0, 0.45, 0.8);
        group.add(cockpit);

        // 日本标志（红圆）
        const circleGeom = new THREE.CircleGeometry(0.1, 16);
        const circleMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const flag = new THREE.Mesh(circleGeom, circleMat);
        flag.position.set(0, 0.41, 0.2);
        flag.rotation.x = -Math.PI / 2;
        group.add(flag);

        group.userData = { type: 'f2', name: 'F-2', country: 'japan' };
        return group;
    }

    // 阵风 Rafale（法国）
    createRafale() {
        const group = new THREE.Group();

        // 机身 - 较宽
        const fuselageGeom = new THREE.BoxGeometry(0.75, 0.42, 3.8);
        const fuselageMat = new THREE.MeshPhongMaterial({ color: 0x6a7a6a });
        const fuselage = new THREE.Mesh(fuselageGeom, fuselageMat);
        fuselage.position.y = 0.21;
        group.add(fuselage);

        // 机头
        const noseGeom = new THREE.ConeGeometry(0.3, 1.2, 5);
        const nose = new THREE.Mesh(noseGeom, fuselageMat);
        nose.rotation.x = Math.PI / 2;
        nose.position.set(0, 0.21, 2.4);
        group.add(nose);

        // 三角鸭翼
        const canardGeom = new THREE.BoxGeometry(1.0, 0.05, 0.5);
        const wingMat = new THREE.MeshPhongMaterial({ color: 0x6a7a6a });

        const leftCanard = new THREE.Mesh(canardGeom, wingMat);
        leftCanard.position.set(-0.5, 0.35, 1.0);
        leftCanard.rotation.z = 0.08;
        group.add(leftCanard);

        const rightCanard = leftCanard.clone();
        rightCanard.position.set(0.5, 0.35, 1.0);
        rightCanard.rotation.z = -0.08;
        group.add(rightCanard);

        // 三角主翼
        const deltaShape = new THREE.Shape();
        deltaShape.moveTo(0, 0);
        deltaShape.lineTo(2.2, 0.2);
        deltaShape.lineTo(2.0, -1.5);
        deltaShape.lineTo(0.2, -1.0);
        deltaShape.lineTo(0, 0);

        const deltaGeom = new THREE.ExtrudeGeometry(deltaShape, { depth: 0.05, bevelEnabled: false });

        const leftWing = new THREE.Mesh(deltaGeom, wingMat);
        leftWing.position.set(0, 0.23, -0.3);
        leftWing.rotation.y = Math.PI;
        group.add(leftWing);

        const rightWing = new THREE.Mesh(deltaGeom, wingMat);
        rightWing.position.set(0, 0.23, -0.3);
        group.add(rightWing);

        // 外倾双垂尾
        const vTailGeom = new THREE.BoxGeometry(0.1, 0.8, 0.5);
        const vTailMat = new THREE.MeshPhongMaterial({ color: 0x6a7a6a });

        const leftVTail = new THREE.Mesh(vTailGeom, vTailMat);
        leftVTail.position.set(-0.45, 0.75, -1.4);
        leftVTail.rotation.z = 0.25;
        group.add(leftVTail);

        const rightVTail = leftVTail.clone();
        rightVTail.position.set(0.45, 0.75, -1.4);
        rightVTail.rotation.z = -0.25;
        group.add(rightVTail);

        // 半埋式进气道
        const intakeGeom = new THREE.BoxGeometry(0.3, 0.2, 0.7);
        const intakeMat = new THREE.MeshPhongMaterial({ color: 0x4a5a4a });

        const leftIntake = new THREE.Mesh(intakeGeom, intakeMat);
        leftIntake.position.set(-0.35, 0.1, 0.5);
        group.add(leftIntake);

        const rightIntake = leftIntake.clone();
        rightIntake.position.set(0.35, 0.1, 0.5);
        group.add(rightIntake);

        // 双发喷口
        const nozzleGeom = new THREE.CylinderGeometry(0.18, 0.14, 0.3, 8);
        const nozzleMat = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            emissive: 0xff6600,
            emissiveIntensity: 0.2
        });

        const leftNozzle = new THREE.Mesh(nozzleGeom, nozzleMat);
        leftNozzle.rotation.x = Math.PI / 2;
        leftNozzle.position.set(-0.22, 0.21, -2.1);
        group.add(leftNozzle);

        const rightNozzle = leftNozzle.clone();
        rightNozzle.position.set(0.22, 0.21, -2.1);
        group.add(rightNozzle);

        // 座舱
        const cockpitGeom = new THREE.BoxGeometry(0.48, 0.24, 0.85);
        const cockpitMat = new THREE.MeshPhongMaterial({ 
            color: 0x99ccdd, 
            transparent: true, 
            opacity: 0.7 
        });
        const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
        cockpit.position.set(0, 0.48, 0.7);
        group.add(cockpit);

        // 法国标志（蓝白红）
        const stripeGeom = new THREE.BoxGeometry(0.3, 0.02, 0.15);
        const blueMat = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const redMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        const blueStripe = new THREE.Mesh(stripeGeom, blueMat);
        blueStripe.position.set(-0.1, 0.43, 0.1);
        group.add(blueStripe);

        const whiteStripe = new THREE.Mesh(stripeGeom, whiteMat);
        whiteStripe.position.set(0, 0.43, 0.1);
        group.add(whiteStripe);

        const redStripe = new THREE.Mesh(stripeGeom, redMat);
        redStripe.position.set(0.1, 0.43, 0.1);
        group.add(redStripe);

        group.userData = { type: 'rafale', name: '阵风', country: 'france' };
        return group;
    }

    // 苏-57（俄罗斯）
    createSu57() {
        const group = new THREE.Group();

        // 机身 - 扁平
        const fuselageGeom = new THREE.BoxGeometry(0.85, 0.35, 4.3);
        const fuselageMat = new THREE.MeshPhongMaterial({ color: 0x4a5a4a });
        const fuselage = new THREE.Mesh(fuselageGeom, fuselageMat);
        fuselage.position.y = 0.18;
        group.add(fuselage);

        // 机头
        const noseGeom = new THREE.ConeGeometry(0.32, 1.4, 5);
        const nose = new THREE.Mesh(noseGeom, fuselageMat);
        nose.rotation.x = Math.PI / 2;
        nose.position.set(0, 0.18, 2.7);
        group.add(nose);

        // 可动前缘（类似鸭翼）
        const canardGeom = new THREE.BoxGeometry(0.9, 0.04, 0.45);
        const wingMat = new THREE.MeshPhongMaterial({ color: 0x4a5a4a });

        const leftCanard = new THREE.Mesh(canardGeom, wingMat);
        leftCanard.position.set(-0.45, 0.32, 1.1);
        group.add(leftCanard);

        const rightCanard = leftCanard.clone();
        rightCanard.position.set(0.45, 0.32, 1.1);
        group.add(rightCanard);

        // 主翼 - 后掠翼
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(2.4, -0.2);
        wingShape.lineTo(2.2, -1.3);
        wingShape.lineTo(0.3, -1.1);
        wingShape.lineTo(0, 0);

        const wingGeom = new THREE.ExtrudeGeometry(wingShape, { depth: 0.05, bevelEnabled: false });

        const leftWing = new THREE.Mesh(wingGeom, wingMat);
        leftWing.position.set(0, 0.2, -0.2);
        leftWing.rotation.y = Math.PI;
        group.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeom, wingMat);
        rightWing.position.set(0, 0.2, -0.2);
        group.add(rightWing);

        // 全动垂尾
        const vTailGeom = new THREE.BoxGeometry(0.12, 0.85, 0.6);
        const vTailMat = new THREE.MeshPhongMaterial({ color: 0x4a5a4a });

        const leftVTail = new THREE.Mesh(vTailGeom, vTailMat);
        leftVTail.position.set(-0.55, 0.7, -1.5);
        leftVTail.rotation.z = 0.2;
        group.add(leftVTail);

        const rightVTail = leftVTail.clone();
        rightVTail.position.set(0.55, 0.7, -1.5);
        rightVTail.rotation.z = -0.2;
        group.add(rightVTail);

        // 进气道
        const intakeGeom = new THREE.BoxGeometry(0.38, 0.28, 0.9);
        const intakeMat = new THREE.MeshPhongMaterial({ color: 0x3a4a3a });

        const leftIntake = new THREE.Mesh(intakeGeom, intakeMat);
        leftIntake.position.set(-0.45, 0.12, 0.7);
        group.add(leftIntake);

        const rightIntake = leftIntake.clone();
        rightIntake.position.set(0.45, 0.12, 0.7);
        group.add(rightIntake);

        // 双发喷口（矢量）
        const nozzleGeom = new THREE.CylinderGeometry(0.2, 0.16, 0.35, 8);
        const nozzleMat = new THREE.MeshPhongMaterial({ 
            color: 0x555555,
            emissive: 0xff5500,
            emissiveIntensity: 0.3
        });

        const leftNozzle = new THREE.Mesh(nozzleGeom, nozzleMat);
        leftNozzle.rotation.x = Math.PI / 2;
        leftNozzle.position.set(-0.25, 0.18, -2.3);
        group.add(leftNozzle);

        const rightNozzle = leftNozzle.clone();
        rightNozzle.position.set(0.25, 0.18, -2.3);
        group.add(rightNozzle);

        // 座舱
        const cockpitGeom = new THREE.BoxGeometry(0.5, 0.22, 0.95);
        const cockpitMat = new THREE.MeshPhongMaterial({ 
            color: 0x88bbcc, 
            transparent: true, 
            opacity: 0.7 
        });
        const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
        cockpit.position.set(0, 0.42, 0.85);
        group.add(cockpit);

        // 俄罗斯标志（简化三色）
        const stripeGeom = new THREE.BoxGeometry(0.25, 0.02, 0.12);
        const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const blueMat = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const redMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        const whiteStripe = new THREE.Mesh(stripeGeom, whiteMat);
        whiteStripe.position.set(0, 0.36, 0.2);
        group.add(whiteStripe);

        const blueStripe = new THREE.Mesh(stripeGeom, blueMat);
        blueStripe.position.set(0, 0.36, 0.05);
        group.add(blueStripe);

        const redStripe = new THREE.Mesh(stripeGeom, redMat);
        redStripe.position.set(0, 0.36, -0.1);
        group.add(redStripe);

        group.userData = { type: 'su57', name: '苏-57', country: 'russia' };
        return group;
    }

    // 获取战机模型
    getFighter(type) {
        switch(type) {
            case 'china': return this.createJ20();
            case 'usa': return this.createF22();
            case 'japan': return this.createF2();
            case 'france': return this.createRafale();
            case 'russia': return this.createSu57();
            default: return this.createJ20();
        }
    }

    // 创建子弹模型
    createBullet() {
        const geom = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6);
        const mat = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            emissive: 0xffaa00,
            emissiveIntensity: 0.8
        });
        const bullet = new THREE.Mesh(geom, mat);
        bullet.rotation.x = Math.PI / 2;
        return bullet;
    }

    // 创建导弹模型
    createMissile() {
        const group = new THREE.Group();

        const bodyGeom = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8);
        const bodyMat = new THREE.MeshPhongMaterial({ color: 0xcc3333 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.rotation.x = Math.PI / 2;
        group.add(body);

        const noseGeom = new THREE.ConeGeometry(0.05, 0.2, 8);
        const noseMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const nose = new THREE.Mesh(noseGeom, noseMat);
        nose.rotation.x = Math.PI / 2;
        nose.position.z = 0.7;
        group.add(nose);

        const wingGeom = new THREE.BoxGeometry(0.25, 0.02, 0.15);
        const wingMat = new THREE.MeshPhongMaterial({ color: 0xcc3333 });
        const wing = new THREE.Mesh(wingGeom, wingMat);
        group.add(wing);

        return group;
    }

    // 创建爆炸效果
    createExplosion() {
        const group = new THREE.Group();
        const particleCount = 15;

        for (let i = 0; i < particleCount; i++) {
            const geom = new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 6, 6);
            const mat = new THREE.MeshBasicMaterial({ 
                color: new THREE.Color().setHSL(0.05 + Math.random() * 0.1, 1, 0.5 + Math.random() * 0.5),
                transparent: true,
                opacity: 0.9
            });
            const particle = new THREE.Mesh(geom, mat);
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.3,
                    (Math.random() - 0.5) * 0.3,
                    (Math.random() - 0.5) * 0.3
                ),
                life: 1.0
            };
            group.add(particle);
        }

        // 闪光
        const flashGeom = new THREE.SphereGeometry(0.5, 8, 8);
        const flashMat = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const flash = new THREE.Mesh(flashGeom, flashMat);
        group.add(flash);

        group.userData = { type: 'explosion', life: 1.0 };
        return group;
    }

    // 创建尾焰效果
    createEngineTrail() {
        const group = new THREE.Group();

        for (let i = 0; i < 5; i++) {
            const geom = new THREE.SphereGeometry(0.08 - i * 0.01, 6, 6);
            const mat = new THREE.MeshBasicMaterial({ 
                color: new THREE.Color().setHSL(0.08, 1, 0.6 - i * 0.1),
                transparent: true,
                opacity: 0.6 - i * 0.1
            });
            const particle = new THREE.Mesh(geom, mat);
            particle.position.z = -0.3 - i * 0.15;
            group.add(particle);
        }

        return group;
    }

    // 创建环境 - 天空盒和地面
    createEnvironment() {
        const group = new THREE.Group();

        // 天空 - 渐变球
        const skyGeom = new THREE.SphereGeometry(80, 32, 32);
        const skyMat = new THREE.MeshBasicMaterial({ 
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeom, skyMat);
        group.add(sky);

        // 云层
        for (let i = 0; i < 20; i++) {
            const cloudGeom = new THREE.SphereGeometry(2 + Math.random() * 3, 8, 8);
            const cloudMat = new THREE.MeshBasicMaterial({ 
                color: 0xffffff,
                transparent: true,
                opacity: 0.4 + Math.random() * 0.3
            });
            const cloud = new THREE.Mesh(cloudGeom, cloudMat);
            cloud.position.set(
                (Math.random() - 0.5) * 60,
                -5 + Math.random() * 10,
                (Math.random() - 0.5) * 60
            );
            cloud.scale.y = 0.4;
            group.add(cloud);
        }

        // 地面网格（用于参考）
        const gridHelper = new THREE.GridHelper(100, 50, 0x444444, 0x222222);
        gridHelper.position.y = -10;
        group.add(gridHelper);

        // 远处山脉
        for (let i = 0; i < 8; i++) {
            const mountainGeom = new THREE.ConeGeometry(3 + Math.random() * 5, 5 + Math.random() * 8, 6);
            const mountainMat = new THREE.MeshPhongMaterial({ color: 0x2d4a3e });
            const mountain = new THREE.Mesh(mountainGeom, mountainMat);
            mountain.position.set(
                (Math.random() - 0.5) * 80,
                -8,
                -20 - Math.random() * 40
            );
            group.add(mountain);
        }

        return group;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FighterModelGenerator;
}
