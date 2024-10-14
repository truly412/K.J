// Matter.js에서 필요한 모듈 가져오기
const { Engine, Render, Runner, Bodies, World, Body, Events } = Matter;

// 엔진과 월드 생성
let engine = Engine.create();
let world = engine.world;
world.gravity.y = 0.8; // 중력 설정

// 캔버스 생성 및 렌더러 설정
const canvas = document.getElementById('pinballCanvas');
const width = window.innerWidth;
const height = window.innerHeight;
const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: width,
        height: height,
        wireframes: false,
        background: '#000'
    }
});

// 볼 생성
const ball = Bodies.circle(width / 2, height - 100, 20, {
    restitution: 0.8,
    friction: 0,
    render: { fillStyle: '#ff0' }
});
World.add(world, ball);

// 바닥 경계
const ground = Bodies.rectangle(width / 2, height, width, 10, { isStatic: true });
World.add(world, ground);

// 패들 생성
const paddleLeft = Bodies.rectangle(150, height - 200, 150, 20, { isStatic: true });
const paddleRight = Bodies.rectangle(width - 150, height - 200, 150, 20, { isStatic: true });
World.add(world, [paddleLeft, paddleRight]);

// 벽 생성
const walls = [
    Bodies.rectangle(0, height / 2, 10, height, { isStatic: true }), // 왼쪽 벽
    Bodies.rectangle(width, height / 2, 10, height, { isStatic: true }), // 오른쪽 벽
    Bodies.rectangle(width / 2, 0, width, 10, { isStatic: true }) // 상단 벽
];
World.add(world, walls);

// 패들 움직임
document.addEventListener('keydown', function(event) {
    if (event.code === 'ArrowLeft') {
        Body.rotate(paddleLeft, -Math.PI / 4);
    } else if (event.code === 'ArrowRight') {
        Body.rotate(paddleRight, Math.PI / 4);
    }
});

document.addEventListener('keyup', function(event) {
    if (event.code === 'ArrowLeft') {
        Body.rotate(paddleLeft, Math.PI / 4); // 원래 위치로
    } else if (event.code === 'ArrowRight') {
        Body.rotate(paddleRight, -Math.PI / 4); // 원래 위치로
    }
});

// 엔진과 렌더러 실행
Engine.run(engine);
Render.run(render);

// 실행 루프 생성
const runner = Runner.create();
Runner.run(runner, engine);

// 충돌 이벤트 처리
Events.on(engine, 'collisionStart', function(event) {
    const pairs = event.pairs;
    pairs.forEach(function(pair) {
        if (pair.bodyA === ball || pair.bodyB === ball) {
            console.log('Ball hit something!');
        }
    });
});
