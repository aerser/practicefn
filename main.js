import {
    initializeDisplay,
    animate,
    addObjectToScene,
    removeObjectFromScene,
    clearScene,
    scene,
} from "./playdisplay.js";

let mode = "aim";
let targets = [];
let walls = [];

/**
 * 初期化処理
 */
function init() {
    // 描写の初期化
    initializeDisplay();

    // UIの設定
    const startBtn = document.getElementById("startBtn");
    const modeSelect = document.getElementById("mode");

    if (!startBtn || !modeSelect) {
        console.error("UI elements not found. Check your HTML.");
        return;
    }

    startBtn.addEventListener("click", startTraining);
    modeSelect.addEventListener("change", (e) => {
        mode = e.target.value;
    });

    // アニメーション開始
    animate();
}

/**
 * トレーニングの開始
 */
function startTraining() {
    clearScene();
    if (mode === "aim") {
        startAimTraining();
    } else if (mode === "edit") {
        startEditTraining();
    }
}

/**
 * Aim Training の開始
 */
function startAimTraining() {
    spawnTargets(10);
    document.addEventListener("click", shootTarget);
}

/**
 * Edit Training の開始
 */
function startEditTraining() {
    clearScene();
    createWalls();
    document.addEventListener("keydown", handleEditKey);
}

/**
 * ターゲットを生成
 * @param {number} count ターゲットの数
 */
function spawnTargets(count) {
    for (let i = 0; i < count; i++) {
        const targetGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const targetMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const target = new THREE.Mesh(targetGeometry, targetMaterial);

        // ランダムな位置に配置
        target.position.set(
            (Math.random() - 0.5) * 20,
            Math.random() * 5 + 1,
            (Math.random() - 0.5) * 20
        );

        addObjectToScene(target);
        targets.push(target);
    }
}

/**
 * ターゲットをクリックで撃つ
 * @param {MouseEvent} event 
 */
function shootTarget(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(targets);
    if (intersects.length > 0) {
        const target = intersects[0].object;
        removeObjectFromScene(target);
        targets = targets.filter((t) => t !== target);
    }
}

/**
 * 壁を生成
 */
function createWalls() {
    const wallPositions = [{ x: 0, y: 0, z: -10 }];
    wallPositions.forEach((pos) => {
        createWall(pos.x, pos.y, pos.z);
    });
}

/**
 * 壁を作成
 * @param {number} x X座標
 * @param {number} y Y座標
 * @param {number} z Z座標
 */
function createWall(x, y, z) {
    const wallGeometry = new THREE.PlaneGeometry(5, 5);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, y + 2.5, z);
    wall.rotation.y = Math.PI;
    addObjectToScene(wall);
    walls.push(wall);
}

/**
 * 編集キーの処理
 * @param {KeyboardEvent} event 
 */
function handleEditKey(event) {
    if (event.key === "Enter") {
        console.log("Edit mode confirmed.");
    }
}

// 初期化の呼び出し
window.onload = init;
