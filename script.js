const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let currentStage = 1;
const maxStage = 2; // 全2ステージ
let isAllCleared = false;

// プレイヤーの設定
const player = { x: 50, y: 150, width: 20, height: 20, vx: 0, vy: 0, grounded: false, baseSpeed: 4, speed: 4 };
const gravity = 0.5;
let cameraX = 0;

// 変数グループ（ステージごとに中身がリセットされるもの）
let platforms = [];
let skates = [];
let enemies = [];
let goal = { x: 0, y: 0, width: 40, height: 100 };

// --- 【ステージデータの作成】 ---
function loadStage(stageNum) {
    document.getElementById("stageDisplay").textContent = "STAGE " + stageNum;
    player.x = 50;
    player.y = 150;
    player.vx = 0;
    player.vy = 0;
    player.speed = player.baseSpeed; // スピードをもとに戻す
    cameraX = 0;

    if (stageNum === 1) {
        // ステージ1：スケボーとジャンプの練習
        platforms = [
            { x: 0, y: 270, width: 1500, height: 30 },
            { x: 300, y: 200, width: 120, height: 15 },
            { x: 600, y: 140, width: 120, height: 15 }
        ];
        skates = [
            { x: 200, y: 240, width: 25, height: 15, active: true } // スケボー
        ];
        enemies = [
            { x: 800, y: 250, width: 20, height: 20, vx: -2, alive: true, type: "walk" } // 歩く敵
        ];
        goal = { x: 1300, y: 170, width: 40, height: 100 };

    } else if (stageNum === 2) {
        // ステージ2：ジャンプして追ってくる強敵が出現！
        platforms = [
            { x: 0, y: 270, width: 1800, height: 30 },
            { x: 250, y: 190, width: 100, height: 15 },
            { x: 500, y: 130, width: 100, height: 15 },
            { x: 850, y: 200, width: 100, height: 15 },
            { x: 1200, y: 140, width: 150, height: 15 }
        ];
        skates = [
            { x: 400, y: 240, width: 25, height: 15, active: true }
        ];
        enemies = [
            { x: 650, y: 250, width: 20, height: 20, vx: -3, vy: 0, grounded: false, alive: true, type: "jump", jumpTimer: 0 } // 跳ぶ敵！
        ];
        goal = { x: 1600, y: 170, width: 40, height: 100 };
    }
}

// 操作ボタンの設定
let keys = {};
window.addEventListener("keydown", e => keys[e.code] = true);
window.addEventListener("keyup", e => keys[e.code] = false);

const btnArea = document.createElement("div");
btnArea.id = "buttonArea";
btnArea.innerHTML = `<button id="btnL">←</button><button id="btnJ">JUMP</button><button id="btnR">→</button>`;
document.body.appendChild(btnArea);

const setupBtn = (id, code) => {
    const b = document.getElementById(id);
    b.addEventListener("touchstart", (e) => { e.preventDefault(); keys[code] = true; });
    b.addEventListener("touchend", () => keys[code] = false);
};
setupBtn("btnL", "ArrowLeft");
setupBtn("btnR", "ArrowRight");
setupBtn("btnJ", "ArrowUp");

// 最初のステージを読み込み
loadStage(currentStage);

// ゲームのメイン処理
setInterval(() => {
    if (isAllCleared) return;

    // 移動
    if (keys["ArrowLeft"]) player.vx = -player.speed;
    else if (keys["ArrowRight"]) player.vx = player.speed;
    else player.vx = 0;

    // ジャンプ
    if (keys["ArrowUp"] && player.grounded) {
        player.vy = -10;
        player.grounded = false;
    }

    player.vy += gravity;
    player.x += player.vx;
    player.y += player.vy;

    if (player.x < 0) player.x = 0;
    if (player.x > 300) cameraX = player.x - 300;
    else cameraX = 0;

    player.grounded = false;

    // 床の判定
    for (let plat of platforms) {
        if (player.x + player.width > plat.x && player.x < plat.x + plat.width) {
            if (player.y + player.height >= plat.y && player.y + player.height <= plat.y + 10 && player.vy >= 0) {
                player.y = plat.y - player.height;
                player.vy = 0;
                player.grounded = true;
            }
        }
    }
    if (player.y >= 250) { player.y = 250; player.vy = 0; player.grounded = true; }

    // 【新ギミック①】スケボー（🛹）を拾うと移動速度が1.7倍にアップ！
    for (let skate of skates) {
        if (skate.active && player.x < skate.x + skate.width && player.x + player.width > skate.x &&
            player.y < skate.y + skate.height && player.y + player.height > skate.y) {
            skate.active = false;
            player.speed = player.baseSpeed * 1.7; // スピードアップ！
        }
    }

    // 【新ギミック②】敵の動きと踏みつけ判定
    for (let ene of enemies) {
        if (!ene.alive) continue;

        // 敵の種類ごとの動き
        if (ene.type === "walk") {
            ene.x += ene.vx;
            if (ene.x < 0 || ene.x > 1400) ene.vx *= -1;
        } else if (ene.type === "jump") {
            ene.x += ene.vx;
            if (ene.x < 0 || ene.x > 1700) ene.vx *= -1;

            // ジャンプする敵の重力計算
            ene.vy += gravity;
            ene.y += ene.vy;
            ene.grounded = false;
            if (ene.y >= 250) { ene.y = 250; ene.vy = 0; ene.grounded = true; }

            // 地面にいるとき、1.5秒（60フレーム）ごとにジャンプして追いかけてくる！
            if (ene.grounded) {
                ene.jumpTimer++;
                if (ene.jumpTimer > 60) {
                    ene.vy = -9; // 大ジャンプ
                    ene.jumpTimer = 0;
                    // プレイヤーのいる方向に方向転換
                    if (player.x < ene.x) ene.vx = -3;
                    else ene.vx = 3;
                }
            }
        }

        // プレイヤーと敵の当たり判定
        if (player.x < ene.x + ene.width && player.x + player.width > ene.x &&
            player.y < ene.y + ene.height && player.y + player.height > ene.y) {
            
            // 【踏みつけ判定】上から踏み落としたら敵が消える、それ以外はミスになって最初から
            if (player.y + player.height <= ene.y + 12 && player.vy > 0) {
                ene.alive = false;
                player.vy = -7; // 踏んだらちょっと跳ねる
            } else {
                loadStage(currentStage); // ミス！ステージの最初から
            }
        }
    }

    // 【新ギミック③】ゴール扉に触れたら次のステージへ進む
    if (player.x < goal.x + goal.width && player.x + player.width > goal.x &&
        player.y < goal.y + goal.height && player.y + player.height > goal.y) {
        
        if (currentStage < maxStage) {
            currentStage++;
            loadStage(currentStage); // 次のステージへ！
        } else {
            isAllCleared = true; // 全クリ！
            document.getElementById("clearMessage").style.display = "block";
        }
    }

    // --- 描画処理 ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 足場・地面（緑）
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(0 - cameraX, 270, 1800, 30);
    for (let plat of platforms) ctx.fillRect(plat.x - cameraX, plat.y, plat.width, plat.height);

    // スケボーを描く（水色の板に黒いタイヤ）
    for (let skate of skates) {
        if (skate.active) {
            ctx.fillStyle = "#00e5ff";
            ctx.fillRect(skate.x - cameraX, skate.y, skate.width, skate.height - 5);
            ctx.fillStyle = "#000"; // タイヤ
            ctx.fillRect(skate.x - cameraX + 2, skate.y + 10, 5, 5);
            ctx.fillRect(skate.x - cameraX + 18, skate.y + 10, 5, 5);
        }
    }

    // 敵を描く
    for (let ene of enemies) {
        if (ene.alive) {
            if (ene.type === "walk") ctx.fillStyle = "#e91e63"; // 歩く敵はピンク
            if (ene.type === "jump") ctx.fillStyle = "#9c27b0"; // 跳ぶ敵は紫
            ctx.fillRect(ene.x - cameraX, ene.y, ene.width, ene.height);
        }
    }

    // ゴール扉（金）
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(goal.x - cameraX, goal.y, goal.width, goal.height);

    // プレイヤー（白。スケボーに乗ると形がちょっと変わる）
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(player.x - cameraX, player.y, player.width, player.height);
    if (player.speed > player.baseSpeed) {
        // スケボーに乗っている時は足元に線を引く
        ctx.fillStyle = "#00e5ff";
        ctx.fillRect(player.x - cameraX - 2, player.y + player.height, player.width + 4, 3);
    }

}, 1000 / 40);