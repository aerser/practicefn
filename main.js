// Import OrbitControls from Three.js
import { OrbitControls } from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let mode = "aim";
let mouseSensitivity = 1.0;
let keyEdit = "E";
let keyConfirm = "Enter";
let targets = [];
let walls = [];
let selectedWall = null;
let editGrid = null;

function init() {
    // Load settings from localStorage
    const savedSettings = JSON.parse(localStorage.getItem("settings")) || {};
    mouseSensitivity = savedSettings.mouseSensitivity || 1.0;
    keyEdit = savedSettings.keyEdit || "E";
    keyConfirm = savedSettings.keyConfirm || "Enter";

    // UI bindings
    document.getElementById("sensitivity").value = mouseSensitivity;
    document.getElementById("keyEdit").value = keyEdit;
    document.getElementById("keyConfirm").value = keyConfirm;
    document.getElementById("startBtn").addEventListener("click", startTraining);
    document.getElementById("mode").addEventListener("change", (e) => {
        mode = e.target.value;
    });

    // Setup Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e1f26); // Set background color

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15); // Set initial camera position
    camera.lookAt(0, 0, -10);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add OrbitControls for mouse movement
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Enable damping for smooth motion
    controls.dampingFactor = 0.05; // Set damping factor

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
    clearScene(); // Clear the previous scene
    createWalls(); // Automatically create walls
    document.addEventListener("click", handleGridClick); // Add click listener for grid interactions
}

function createWalls() {
    const wallPositions = [
        { x: -5, y: 0, z: -10 },
        { x: 0, y: 0, z: -10 },
        { x: 5, y: 0, z: -10 }
    ];

    wallPositions.forEach((pos) => {
        createWall(pos.x, pos.y, pos.z);
    });

    console.log("Walls created at these positions:", wallPositions);
}

function spawnTargets(count) {
    for (let i = 0; i < count; i++) {
        const targetGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const targetMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const target = new THREE.Mesh(targetGeometry, targetMaterial);
        target.position.set(
            (Math.random() - 0.5) * 20,
            Math.random() * 5 + 1,
            (Math.random() - 0.5) * 20
        );
        scene.add(target);
        targets.push(target);
    }
}

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

function createWall(x, y, z) {
    const wallGeometry = new THREE.PlaneGeometry(5, 5);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, y + 2.5, z);
    wall.rotation.y = Math.PI;
    scene.add(wall);
    walls.push(wall);
}

function handleGridClick(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(editGrid);
    if (intersects.length > 0) {
        const selectedCell = intersects[0];
        console.log("Grid cell selected:", selectedCell.point);
        // Add any logic for selecting/editing the grid cell here
    } else {
        console.log("No grid cell intersected.");
    }
}

function showEditGrid(wall) {
    if (editGrid) scene.remove(editGrid);
    const gridGeometry = new THREE.PlaneGeometry(5, 5, 3, 3);
    const gridMaterial = new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        wireframe: true,
    });
    editGrid = new THREE.Mesh(gridGeometry, gridMaterial);
    editGrid.position.copy(wall.position);
    editGrid.rotation.copy(wall.rotation);
    scene.add(editGrid);
    console.log("Edit grid displayed on wall at:", wall.position);
}

function clearScene() {
    targets.forEach((target) => scene.remove(target));
    walls.forEach((wall) => scene.remove(wall));
    if (editGrid) scene.remove(editGrid);
    targets = [];
    walls = [];
    selectedWall = null;
    editGrid = null;
}

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls
    renderer.render(scene, camera);
}

// Initialize the app
window.onload = init;
