// 사다리의 열과 가로줄의 개수를 정의합니다.
const numColumns = 5;  // 사다리의 열
const numRows = 10;    // 사다리의 가로줄
const canvas = document.getElementById("ladderCanvas");
const ctx = canvas.getContext("2d");

const columnSpacing = canvas.width / numColumns;
const rowSpacing = canvas.height / numRows;

// 가로선을 저장할 배열
let horizontalLines = [];

// 가로줄을 무작위로 생성하는 함수
function generateLadder() {
    horizontalLines = [];
    for (let i = 0; i < numRows; i++) {
        let rowLines = [];
        for (let j = 0; j < numColumns - 1; j++) {
            // 랜덤으로 가로줄을 만들 확률
            if (Math.random() > 0.5) {
                rowLines.push(true);
            } else {
                rowLines.push(false);
            }
        }
        horizontalLines.push(rowLines);
    }
}

// 사다리를 그리는 함수
function drawLadder() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 세로줄 그리기
    for (let i = 0; i < numColumns; i++) {
        ctx.beginPath();
        ctx.moveTo(i * columnSpacing, 0);
        ctx.lineTo(i * columnSpacing, canvas.height);
        ctx.stroke();
    }

    // 가로줄 그리기
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numColumns - 1; j++) {
            if (horizontalLines[i][j]) {
                ctx.beginPath();
                ctx.moveTo(j * columnSpacing, i * rowSpacing);
                ctx.lineTo((j + 1) * columnSpacing, i * rowSpacing);
                ctx.stroke();
            }
        }
    }
}

// 플레이어 이동 로직
function movePlayer(startColumn) {
    let currentColumn = startColumn;
    let currentRow = 0;

    // 플레이어의 이동을 애니메이션처럼 보이게 함
    const interval = setInterval(function() {
        if (currentRow >= numRows) {
            clearInterval(interval);
            alert(`플레이어가 ${currentColumn + 1} 열로 도착했습니다!`);
            return;
        }

        // 플레이어의 현재 위치
        let x = currentColumn * columnSpacing;
        let y = currentRow * rowSpacing;

        // 현재 위치 그리기
        drawLadder(); // 기존 사다리를 다시 그리기 (플레이어의 이동을 덮지 않기 위함)
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();

        // 가로선이 있는지 체크하여 플레이어 이동
        if (currentColumn > 0 && horizontalLines[currentRow][currentColumn - 1]) {
            currentColumn--;
        } else if (currentColumn < numColumns - 1 && horizontalLines[currentRow][currentColumn]) {
            currentColumn++;
        }

        currentRow++;
    }, 500);  // 플레이어가 한 줄씩 내려가는 속도 (500ms마다 한 줄씩 이동)
}

// 게임 시작 함수 (열 선택)
function startGame(startColumn) {
    generateLadder();  // 사다리 생성
    drawLadder();  // 사다리 그리기
    movePlayer(startColumn);  // 선택된 열에서 플레이어 이동 시작
}

// 처음 로드 시 사다리를 생성하고 그리기
generateLadder();
drawLadder();
