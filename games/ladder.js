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

// 게임 시작 시 플레이어가 선택한 위치에서 사다리 타기를 진행하는 함수
function startGame() {
    generateLadder();  // 사다리 생성
    drawLadder();  // 사다리 그리기
    
    // 여기서 플레이어의 이동 로직을 추가하여 사다리를 타게 할 수 있습니다.
    // 예시: 플레이어가 선택한 열에서 출발하여 가로줄을 따라 이동.
}

// 처음 로드 시 사다리를 생성하고 그리기
generateLadder();
drawLadder();
