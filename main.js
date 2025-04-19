// プレイヤー設定の変数
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

// 設定をローカルストレージに保存
function saveSettings() {
  const settings = {
    keyForward,
    keyJump,
    keyBuild,
    keyEdit,
    mouseSensitivity,
    gamepadSensitivity,
  };
  localStorage.setItem('playerSettings', JSON.stringify(settings));
}

// エイム練習機能
function startAimPractice() {
  const canvas = document.getElementById('gameCanvas');
  canvas.style.display = 'block';
  const context = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let x = 50,
    y = 50;

  function drawTarget() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.arc(x, y, 20, 0, Math.PI * 2, false);
    context.fillStyle = 'red';
    context.fill();
    context.closePath();
  }

  let duration = 10; // 練習時間
  const interval = setInterval(() => {
    if (duration <= 0) {
      clearInterval(interval);
      canvas.style.display = 'none';
      alert('エイム練習終了！');
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() * canvas.height;
      drawTarget();
      duration--;
    }
  }, 1000);
}

// 編集練習機能
function startEditPractice() {
  const canvas = document.getElementById('gameCanvas');
  canvas.style.display = 'none'; // 編集練習では描画しない
  const gameContainer = document.getElementById('ui');
  gameContainer.innerHTML = ''; // 以前の内容をクリア

  const builds = ['壁', '床', '屋根', '階段'];
  builds.forEach((build, index) => {
    const element = document.createElement('div');
    element.className = 'build-piece';
    element.style.position = 'absolute';
    element.style.width = '100px';
    element.style.height = '100px';
    element.style.backgroundColor = 'gray';
    element.style.left = `${index * 120 + 100}px`;
    element.style.top = '200px';
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
