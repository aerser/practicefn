import { initializeDisplay, animate, scene } from "./playdisplay.js";

let mode = "aim";
let mouseSensitivity = 1.0;
let targets = [];
let walls = [];
let selectedWall = null;
let editGrid = null;
let selectedCells = [];
let keyEdit = "E";
let keyConfirm = "Enter";
let keyReset = "R";
let audioEdit, audioConfirm;

/**
 * 初期化関数
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

    // 音声ファイルのロード
    audioEdit = new Audio("edit-mode.mp3"); // 編集モード効果音
    audioConfirm = new Audio("confirm.mp3"); // 確定時効果音

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
    document.addEventListener("mousemove", handleMouseDrag);
    document.addEventListener("mouseup", handleMouseUp);
}

/**
 * ターゲットを生成する
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

/**
 * ターゲットをクリックして撃つ
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
        scene.remove(target);
        targets = targets.filter((t) => t !== target);
    }
}

/**
 * 壁を生成する
 */
function createWalls() {
    const wallPositions = [{ x: 0, y: 0, z: -10 }];
    wallPositions.forEach((pos) => {
        createWall(pos.x, pos.y, pos.z);
    });
}

/**
 * 壁を作成し、シーンに追加
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
    scene.add(wall);
    walls.push(wall);
}

/**
 * 編集モードのキー入力を処理
 * @param {KeyboardEvent} event 
 */
function handleEditKey(event) {
    if (event.key.toUpperCase() === keyEdit) {
        audioEdit.play();
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const intersects = raycaster.intersectObjects(walls);
        if (intersects.length > 0) {
            selectedWall = intersects[0].object;
            showEditGrid(selectedWall);
        }
    } else if (event.key.toUpperCase() === keyConfirm && selectedWall) {
        audioConfirm.play();
        confirmEdit();
    } else if (event.key.toUpperCase() === keyReset) {
        resetWall();
    }
}

/**
 * 編集用のグリッドを表示
 * @param {THREE.Mesh} wall 編集対象の壁
 */
function showEditGrid(wall) {
    if (editGrid) scene.remove(editGrid);
    selectedCells = [];
    const gridGeometry = new THREE.PlaneGeometry(5, 5, 3, 3);
    const gridMaterial = new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        wireframe: true,
    });
    editGrid = new THREE.Mesh(gridGeometry, gridMaterial);
    editGrid.position.copy(wall.position);
    editGrid.rotation.copy(wall.rotation);
    scene.add(editGrid);
}

/**
 * マウスドラッグでグリッドを選択
 * @param {MouseEvent} event 
 */
function handleMouseDrag(event) {
    if (!editGrid) return;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(editGrid);
    if (intersects.length > 0) {
        const point = intersects[0].point;
        const cellIndex = getGridCellIndex(point);
        if (!selectedCells.includes(cellIndex)) {
            selectedCells.push(cellIndex);
            highlightCell(cellIndex);
        }
    }
}

/**
 * 選択されたグリッドをハイライト表示
 * @param {Object} cellIndex 
 */
function highlightCell(cellIndex) {
    const cellGeometry = new THREE.PlaneGeometry(5 / 3, 5 / 3);
    const cellMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
    });
    const cell = new THREE.Mesh(cellGeometry, cellMaterial);
    cell.position.set(
        editGrid.position.x - 2.5 + cellIndex.col * (5 / 3) + (5 / 6),
        editGrid.position.y - 2.5 + cellIndex.row * (5 / 3) + (5 / 6),
        editGrid.position.z + 0.01
    );
    scene.add(cell);
}

/**
 * グリッドのセルインデックスを取得
 * @param {THREE.Vector3} point 
 * @returns {Object} セルインデックス
 */
function getGridCellIndex(point) {
    const localPoint = new THREE.Vector3();
    editGrid.worldToLocal(localPoint.copy(point));
    const col = Math.floor((localPoint.x + 2.5) / (5 / 3));
    const row = Math.floor((localPoint.y + 2.5) / (5 / 3));
    return { row, col };
}

/**
 * 編集を確定
 */
function confirmEdit() {
    selectedCells.forEach((cell) => {
        // 選択されていないセル処理
    });
    resetWall();
}

/**
 * 壁をリセット
 */
function resetWall() {
    clearScene();
    createWalls();
}

/**
 * シーンをクリア
 */
function clearScene() {
    targets.forEach((target) => scene.remove(target));
    walls.forEach((wall) => scene.remove(wall));
    if (editGrid) scene.remove(editGrid);
    targets = [];
    walls = [];
    selectedWall = null;
    editGrid = null;
    selectedCells = [];
}

// 初期化の呼び出し
window.onload = init;
