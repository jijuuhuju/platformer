const logArea = document.getElementById("logArea");
const typingCode = document.getElementById("typingCode");
const barInner = document.getElementById("barInner");
const percentText = document.getElementById("percentText");
const successMessage = document.getElementById("successMessage");
const downloadStatus = document.getElementById("downloadStatus");

// 今回はハッキングが成功していく様子のダミーコード
const codeLines = [
    "Searching vulnerabilities in central core...\n",
    "Found Exploit: CVE-2026-9999 [Mainframe Bypass]\n",
    "root@hacker:~# inject --payload=bypass_core.bin\n",
    "[OK] Firewall cracked successfully.\n",
    "[OK] Security protocols deactivated.\n",
    "root@hacker:~# override --target=database\n",
    "Synchronizing encryption keys...\n",
    "Cracking RSA 8192-bit master key...\n",
    "[PROGRESS] 25%... 50%... 75%...\n",
    "[SUCCESS] Admin permissions acquired!\n"
];

let lineIndex = 0;
let charIndex = 0;
let currentPercent = 0;

// 自動タイピング
function startHacking() {
    if (currentPercent >= 100) return;

    let currentLine = codeLines[lineIndex];
    typingCode.textContent += currentLine[charIndex];
    charIndex++;

    if (charIndex >= currentLine.length) {
        logArea.textContent += typingCode.textContent;
        typingCode.textContent = "";
        charIndex = 0;
        lineIndex = (lineIndex + 1) % codeLines.length;
    }

    logArea.scrollTop = logArea.scrollHeight;
    setTimeout(startHacking, 20 + Math.random() * 40);
}

// 進行度メーターの更新
function updateProgress() {
    if (currentPercent < 100) {
        currentPercent += Math.floor(Math.random() * 4) + 1;
        if (currentPercent > 100) currentPercent = 100;

        barInner.style.width = currentPercent + "%";
        percentText.textContent = currentPercent + "%";

        setTimeout(updateProgress, 80 + Math.random() * 100);
    } else {
        // 100%になったらアクセス成功演出を発動！
        triggerAccessGranted();
    }
}

// 【新演出】アクセス成功時の大がかりな仕掛け
function triggerAccessGranted() {
    // 1. 成功メッセージを画面の中央にフェードイン（点滅開始）
    successMessage.style.display = "block";
    
    // 2. ターミナル画面の色をネオンブルーに書き換えてサイバー感をアップさせる
    const term = document.getElementById("terminal");
    term.style.borderColor = "#00e5ff";
    term.style.boxShadow = "0 0 30px rgba(0, 229, 255, 0.4)";
    logArea.style.color = "#00e5ff";
    
    logArea.textContent += "\n\n======================================\n";
    logArea.textContent += "[SUCCESS] CORE SYSTEM CONTROL ACQUIRED.\n";
    logArea.textContent += "[SUCCESS] ACCESS GRANTED TO ALL FILES.\n";
    logArea.textContent += "======================================\n\n";
    logArea.scrollTop = logArea.scrollHeight;

    // 3. 2秒後に「ダウンロード完了」の演出をさらに追加！
    setTimeout(() => {
        downloadStatus.textContent = "DOWNLOAD COMPLETE. SYSTEM CAPTURED! ☺";
        downloadStatus.style.color = "#00ff66";
        downloadStatus.style.fontWeight = "bold";
    }, 2000);
}

// 起動！
startHacking();
updateProgress();