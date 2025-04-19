const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// プレイヤーの設定を管理する変数
let keyForward = 'w';
let keyJump = ' ';
let keyBuild = 'b';
let keyEdit = 'e';
let mouseSensitivity = 1.0;
let gamepadSensitivity = 1.0;

// 初期設定をローカルストレージからロード
window.onload = () => {
  const savedSettings = JSON.parse(localStorage.getItem('playerSettings')) || {};
  keyForward = savedSettings.keyForward || 'w';
  keyJump = savedSettings.keyJump || ' ';
  keyBuild = savedSettings.keyBuild || 'b';
  keyEdit = savedSettings.keyEdit || 'e';
  mouseSensitivity = savedSettings.mouseSensitivity || 1.0;
  gamepadSensitivity = savedSettings.gamepadSensitivity || 1.0;

  // UIに設定を反映
  document.getElementById('keyForward').value = keyForward;
  document.getElementById('keyJump').value = keyJump;
  document.getElementById('keyBuild').value = keyBuild;
  document.getElementById('keyEdit').value = keyEdit;
  document.getElementById('sensitivity').value = mouseSensitivity;
  document.getElementById('gamepadSensitivity').value = gamepadSensitivity;
};

// 設定をローカルストレージに保存する関数
function saveSettings() {
  const settings = {
    keyForward,
    keyJump,
    keyBuild,
    keyEdit,
    mouseSensitivity,
    gamepadSensitivity
  };
  localStorage.setItem('playerSettings', JSON.stringify(settings));
}

// UIのイベントリスナー
document.getElementById('keyForward').addEventListener('input', (e) => {
  keyForward = e.target.value;
  saveSettings();
});

document.getElementById('keyJump').addEventListener('input', (e) => {
  keyJump = e.target.value;
  saveSettings();
});

document.getElementById('keyBuild').addEventListener('input', (e) => {
  keyBuild = e.target.value;
  saveSettings();
});

document.getElementById('keyEdit').addEventListener('input', (e) => {
  keyEdit = e.target.value;
  saveSettings();
});

document.getElementById('sensitivity').addEventListener('input', (e) => {
  mouseSensitivity = parseFloat(e.target.value);
  saveSettings();
});

document.getElementById('gamepadSensitivity').addEventListener('input', (e) => {
  gamepadSensitivity = parseFloat(e.target.value);
  saveSettings();
});

// エイム練習機能
function startAimPractice() {
  const target = document.createElement('div');
  target.classList.add('target');
  document.body.appendChild(target);

  let duration = 10; // 秒数
  const interval = setInterval(() => {
    if (duration <= 0) {
      clearInterval(interval);
      target.remove();
      alert('エイム練習終了！');
    } else {
      target.style.left = Math.random() * window.innerWidth + 'px';
      target.style.top = Math.random() * window.innerHeight + 'px';
      duration--;
    }
  }, 1000);
}

// 編集練習機能
function startEditPractice() {
  const builds = ['壁', '床', '屋根', '階段'];
  builds.forEach((build, index) => {
    const element = document.createElement('div');
    element.className = 'build-piece';
    element.style.left = `${index * 150}px`;
    element.textContent = build;
    document.body.appendChild(element);

    element.addEventListener('click', () => {
      element.style.transition = 'opacity 1s';
      element.style.opacity = 0;
      setTimeout(() => element.remove(), 1000);
    });
  });
}

// スタートボタンの処理
document.getElementById('startBtn').addEventListener('click', () => {
  const mode = document.getElementById('mode').value;
  if (mode === 'aim') {
    startAimPractice();
  } else if (mode === 'edit') {
    startEditPractice();
  }
});
