import { OrbitControls } from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let mode = "aim";
let mouseSensitivity = 1.0;
let keyEdit = "E";
let keyConfirm = "Enter";
let keyReset = "R";
let targets = [];
let walls = [];
let selectedWall = null;
let editGrid = null;
let selectedCells = [];
let audioEdit, audioConfirm;

function init() {
    // Load settings from localStorage
    const savedSettings = JSON.parse(localStorage.getItem("settings")) || {};
    mouseSensitivity = savedSettings.mouseSensitivity || 1.0;
    keyEdit = savedSettings.keyEdit || "E";
    keyConfirm = savedSettings.keyConfirm || "Enter";
    keyReset = savedSettings.keyReset || "R";

    // UI bindings
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

    // Load audio effects
    audioEdit = new Audio("edit-mode.mp3");
    audioConfirm = new Audio("confirm.mp3");

    // Setup Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e1f26);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, -10);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add OrbitControls for camera movement
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 10);
    scene.add(light);

    // Add ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Handle window resize
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Start render loop
    animate();
}

function startTraining() {
    clearScene();
    if (mode === "aim") {
        startAimTraining();
    } else if (mode === "edit") {
        startEditTraining();
    }
}

function startAimTraining() {
    spawnTargets(10);
    document.addEventListener("click", shootTarget);
}

function startEditTraining() {
    clearScene();
    createWalls();
    document.addEventListener("keydown", handleEditKey);
    document.addEventListener("mousemove", handleMouseDrag);
    document.addEventListener("mouseup", handleMouseUp);
}

function createWalls() {
    const wallPositions = [{ x: 0, y: 0, z: -10 }];
    wallPositions.forEach((pos) => {
        createWall(pos.x, pos.y, pos.z);
    });
}

function createWall(x, y, z) {
    const wallGeometry = new THREE.PlaneGeometry(5, 5);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, y + 2.5, z);
    wall.rotation.y = Math.PI;
    scene.add(wall);
    walls.push(wall);
}

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

function getGridCellIndex(point) {
    const localPoint = new THREE.Vector3();
    editGrid.worldToLocal(localPoint.copy(point));
    const col = Math.floor((localPoint.x + 2.5) / (5 / 3));
    const row = Math.floor((localPoint.y + 2.5) / (5 / 3));
    return { row, col };
}

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

function confirmEdit() {
    selectedCells.forEach((cell) => {
        // Remove selected cells
    });
    resetWall();
}

function resetWall() {
    clearScene();
    createWalls();
}

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

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Initialize the app
window.onload = init;
