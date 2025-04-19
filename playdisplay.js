import { OrbitControls } from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/controls/OrbitControls.js";

export let scene, camera, renderer, controls;
let light, ground;

/**
 * 描写処理全体の初期化
 */
export function initializeDisplay() {
    // シーンの作成
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e1f26);

    // カメラの作成
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, -10);

    // レンダラーの作成
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // コントロールの作成
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 遅延効果
    controls.dampingFactor = 0.05; // 遅延の強さ

    // ライトの追加
    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 10);
    scene.add(light);

    // 地面の追加
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // ウィンドウリサイズ対応
    window.addEventListener("resize", onWindowResize);
}

/**
 * ウィンドウリサイズ時の処理
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * アニメーションループ処理
 */
export function animate() {
    requestAnimationFrame(animate);
    controls.update(); // カメラコントロールの更新
    renderer.render(scene, camera); // シーンの描画
}

/**
 * 3Dオブジェクトをシーンに追加
 * @param {THREE.Object3D} object 追加するオブジェクト
 */
export function addObjectToScene(object) {
    scene.add(object);
}

/**
 * 3Dオブジェクトをシーンから削除
 * @param {THREE.Object3D} object 削除するオブジェクト
 */
export function removeObjectFromScene(object) {
    scene.remove(object);
}

/**
 * シーンをクリア（すべてのオブジェクトを削除）
 */
export function clearScene() {
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    // ライトと地面を再追加
    scene.add(light);
    scene.add(ground);
}
