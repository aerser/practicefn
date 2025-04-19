import {
    initializeDisplay,
    animate,
    scene,
} from "./playdisplay.js";

let mode = "aim";
let targets = [];

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
    console.log("Starting training in mode:", mode);
    if (mode === "aim") {
        startAimTraining();
    } else if (mode === "edit") {
        console.log("Edit Training not implemented yet.");
    }
}

/**
 * Aim Training の開始
 */
function startAimTraining() {
    console.log("Starting Aim Training...");
    spawnTargets(10);
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
        scene.add(target);
        targets.push(target);
    }
}

// 初期化の呼び出し
window.onload = init;
