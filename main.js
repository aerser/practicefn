let scene, camera, renderer;
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
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

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

  // Camera setup
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);

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
  createWall(0, 0, -5);
  document.addEventListener("keydown", handleEditKey);
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
  const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.set(x, y + 2.5, z);
  wall.rotation.y = Math.PI;
  scene.add(wall);
  walls.push(wall);
}

function handleEditKey(event) {
  if (event.key.toUpperCase() === keyEdit) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(walls);
    if (intersects.length > 0) {
      selectedWall = intersects[0].object;
      showEditGrid(selectedWall);
    }
  } else if (event.key === keyConfirm && selectedWall) {
    confirmEdit(selectedWall);
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
}

function confirmEdit(wall) {
  scene.remove(wall);
  scene.remove(editGrid);
  walls = walls.filter((w) => w !== wall);
  selectedWall = null;
  editGrid = null;
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
  renderer.render(scene, camera);
}

// Initialize the app
window.onload = init;
