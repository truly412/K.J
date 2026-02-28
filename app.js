(function () {
  var picker = document.getElementById("picker");
  var sizeSelect = document.getElementById("sizeSelect");
  var btnStart = document.getElementById("btnStart");
  var btnRestart = document.getElementById("btnRestart");
  var btnUndo = document.getElementById("btnUndo");
  var btnExport = document.getElementById("btnExport");

  var statusEl = document.getElementById("status");
  var matchEl = document.getElementById("match");

  var leftCard = document.getElementById("leftCard");
  var rightCard = document.getElementById("rightCard");
  var leftImg = document.getElementById("leftImg");
  var rightImg = document.getElementById("rightImg");
  var leftName = document.getElementById("leftName");
  var rightName = document.getElementById("rightName");

  var logEl = document.getElementById("log");

  var selectedFiles = []; // File[]
  var state = resetState();
  var currentLeft = null;  // { id, file, url }
  var currentRight = null; // { id, file, url }

  function resetState() {
    return {
      round: 1,
      pool: [],        // [{id,file}]
      nextPool: [],    // [{id,file}]
      matchIndex: 0,
      totalStart: 0,
      history: [],     // undo stack snapshots
      results: []      // [{round, leftId, rightId, winnerId, leftName, rightName, winnerName}]
    };
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function clearLog() {
    logEl.innerHTML = "";
  }

  function addLog(line) {
    var li = document.createElement("li");
    li.textContent = line;
    logEl.appendChild(li);
  }

  function isImageFile(file) {
    if (!file) return false;
    if (file.type && file.type.indexOf("image/") === 0) return true;

    // fallback (type이 비어있는 경우 대비)
    var name = String(file.name || "").toLowerCase();
    return endsWithAny(name, [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"]);
  }

  function endsWithAny(text, suffixes) {
    for (var i = 0; i < suffixes.length; i++) {
      if (text.slice(-suffixes[i].length) === suffixes[i]) return true;
    }
    return false;
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function pickSize(allCount) {
    var v = sizeSelect.value;
    if (v === "all") return allCount;
    var n = parseInt(v, 10);
    if (isNaN(n)) return allCount;
    return n;
  }

  function sampleToSize(items, size) {
    if (size >= items.length) return items.slice();
    // 랜덤 샘플
    var copy = items.slice();
    shuffle(copy);
    return copy.slice(0, size);
  }

  function releaseCurrentUrls() {
    // 객체 URL은 사용 후 해제하는 게 안전 (메모리 관리) :contentReference[oaicite:2]{index=2}
    if (currentLeft && currentLeft.url) URL.revokeObjectURL(currentLeft.url);
    if (currentRight && currentRight.url) URL.revokeObjectURL(currentRight.url);
    currentLeft = null;
    currentRight = null;
  }

  function snapshotForUndo() {
    // File 객체는 그대로 참조해도 괜찮고, pool/nextPool/results/history는 복사
    return {
      round: state.round,
      pool: state.pool.slice(),
      nextPool: state.nextPool.slice(),
      matchIndex: state.matchIndex,
      results: state.results.slice()
    };
  }

  function restoreFromUndo(snap) {
    state.round = snap.round;
    state.pool = snap.pool.slice();
    state.nextPool = snap.nextPool.slice();
    state.matchIndex = snap.matchIndex;
    state.results = snap.results.slice();
  }

  function updateButtons() {
    btnStart.disabled = selectedFiles.length < 2;
    btnRestart.disabled = state.totalStart === 0;
    btnUndo.disabled = state.history.length === 0;
    btnExport.disabled = state.totalStart === 0;
  }

  function showMatch(left, right) {
    releaseCurrentUrls();

    var leftUrl = URL.createObjectURL(left.file);
    var rightUrl = URL.createObjectURL(right.file);

    currentLeft = { id: left.id, file: left.file, url: leftUrl };
    currentRight = { id: right.id, file: right.file, url: rightUrl };

    leftImg.src = leftUrl;
    rightImg.src = rightUrl;

    leftName.textContent = left.file.webkitRelativePath ? left.file.webkitRelativePath : left.file.name;
    rightName.textContent = right.file.webkitRelativePath ? right.file.webkitRelativePath : right.file.name;

    matchEl.hidden = false;
  }

  function finalizeWinner(single) {
    releaseCurrentUrls();
    matchEl.hidden = true;

    var name = single.file.webkitRelativePath ? single.file.webkitRelativePath : single.file.name;
    setStatus("최종 우승: " + name + "  🎉");

    addLog("🏆 우승: " + name);
    updateButtons();
  }

  function nextRoundIfNeeded() {
    if (state.pool.length === 0) {
      state.pool = state.nextPool.slice();
      state.nextPool = [];
      shuffle(state.pool);
      state.round += 1;
      state.matchIndex = 0;
    }
  }

  function applyByeIfOdd() {
    if (state.pool.length % 2 === 1) {
      var bye = state.pool.pop();
      state.nextPool.push(bye);

      var byeName = bye.file.webkitRelativePath ? bye.file.webkitRelativePath : bye.file.name;
      addLog("부전승: " + byeName);
    }
  }

  function statusLine() {
    var remainingThisRound = state.pool.length + state.nextPool.length;
    var roundText = "Round " + state.round;
    return roundText + " | 남은 후보: " + remainingThisRound + " | 진행한 매치: " + state.matchIndex;
  }

  function nextMatch() {
    nextRoundIfNeeded();

    if (state.pool.length === 1 && state.nextPool.length === 0) {
      finalizeWinner(state.pool[0]);
      return;
    }

    if (state.pool.length < 2) {
      // 안전장치: nextRound로 넘긴 뒤 다시 체크
      nextRoundIfNeeded();
      if (state.pool.length === 1 && state.nextPool.length === 0) {
        finalizeWinner(state.pool[0]);
        return;
      }
    }

    applyByeIfOdd();

    if (state.pool.length < 2) {
      // 부전승 처리 후 라운드 정리
      nextRoundIfNeeded();
      if (state.pool.length === 1 && state.nextPool.length === 0) {
        finalizeWinner(state.pool[0]);
      } else {
        nextMatch();
      }
      return;
    }

    var left = state.pool.pop();
    var right = state.pool.pop();
    state.matchIndex += 1;

    setStatus(statusLine() + " | 둘 중 하나를 클릭!");
    showMatch(left, right);
    updateButtons();
  }

  function choose(side) {
    if (!currentLeft || !currentRight) return;

    // undo 스냅샷 저장
    state.history.push(snapshotForUndo());

    var winner = side === "left" ? currentLeft : currentRight;
    var loser = side === "left" ? currentRight : currentLeft;

    state.nextPool.push({ id: winner.id, file: winner.file });

    var leftN = currentLeft.file.webkitRelativePath ? currentLeft.file.webkitRelativePath : currentLeft.file.name;
    var rightN = currentRight.file.webkitRelativePath ? currentRight.file.webkitRelativePath : currentRight.file.name;
    var winN = winner.file.webkitRelativePath ? winner.file.webkitRelativePath : winner.file.name;

    state.results.push({
      round: state.round,
      leftId: currentLeft.id,
      rightId: currentRight.id,
      winnerId: winner.id,
      leftName: leftN,
      rightName: rightN,
      winnerName: winN
    });

    addLog("R" + state.round + " - " + leftN + " vs " + rightN + " → 승자: " + winN);

    nextMatch();
  }

  function undo() {
    if (state.history.length === 0) return;
    releaseCurrentUrls();

    var snap = state.history.pop();
    restoreFromUndo(snap);

    clearLog();
    for (var i = 0; i < state.results.length; i++) {
      var r = state.results[i];
      addLog("R" + r.round + " - " + r.leftName + " vs " + r.rightName + " → 승자: " + r.winnerName);
    }

    setStatus(statusLine() + " | 되돌림 완료. 계속 진행!");
    nextMatch();
  }

  function startGame() {
    if (selectedFiles.length < 2) return;

    releaseCurrentUrls();
    clearLog();

    state = resetState();

    var items = [];
    for (var i = 0; i < selectedFiles.length; i++) {
      items.push({ id: "f_" + i + "_" + Date.now(), file: selectedFiles[i] });
    }

    var target = pickSize(items.length);
    var chosen = sampleToSize(items, target);
    shuffle(chosen);

    state.pool = chosen;
    state.totalStart = chosen.length;

    setStatus("시작! 총 " + state.totalStart + "장으로 진행");
    addLog("시작 후보 수: " + state.totalStart);

    updateButtons();
    nextMatch();
  }

  function restartGame() {
    if (selectedFiles.length < 2) return;
    startGame();
  }

  function exportResults() {
    if (state.totalStart === 0) return;

    var payload = {
      exportedAt: new Date().toISOString(),
      totalStart: state.totalStart,
      results: state.results
    };

    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);

    var a = document.createElement("a");
    a.href = url;
    a.download = "photo-worldcup-results.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }

  function onKeyChoose(e, side) {
    var key = e.key;
    if (key === "Enter" || key === " ") {
      e.preventDefault();
      choose(side);
    }
  }

  picker.addEventListener("change", function (e) {
    var files = e.target.files ? Array.prototype.slice.call(e.target.files) : [];
    var imgs = [];

    for (var i = 0; i < files.length; i++) {
      if (isImageFile(files[i])) imgs.push(files[i]);
    }

    selectedFiles = imgs;

    if (selectedFiles.length >= 2) {
      setStatus("이미지 " + selectedFiles.length + "장 선택됨. 라운드 크기 선택 후 시작!");
    } else {
      setStatus("이미지가 2장 이상 필요해.");
    }

    updateButtons();
  });

  btnStart.addEventListener("click", startGame);
  btnRestart.addEventListener("click", restartGame);
  btnUndo.addEventListener("click", undo);
  btnExport.addEventListener("click", exportResults);

  leftCard.addEventListener("click", function () { choose("left"); });
  rightCard.addEventListener("click", function () { choose("right"); });

  leftCard.addEventListener("keydown", function (e) { onKeyChoose(e, "left"); });
  rightCard.addEventListener("keydown", function (e) { onKeyChoose(e, "right"); });

  updateButtons();
})();