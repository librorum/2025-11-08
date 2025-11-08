// 하드웨어 터미널 디스플레이 해상도 (고정)
const TERMINAL_WIDTH = 640;
const TERMINAL_HEIGHT = 480;

// Canvas 및 컨텍스트 참조
let canvas, ctx;

// 현재 색상 (기본값: 흰색)
let current_color = { r: 255, g: 255, b: 255 };

/**
 * Canvas 크기 초기화 및 스케일링
 */
function initCanvas() {
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;
    
    // 실제 해상도는 고정
    canvas.width = TERMINAL_WIDTH;
    canvas.height = TERMINAL_HEIGHT;
    
    // CSS로 스케일링
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const scaleX = containerWidth / TERMINAL_WIDTH;
    const scaleY = containerHeight / TERMINAL_HEIGHT;
    const scale = Math.min(scaleX, scaleY); // 비율 유지
    
    canvas.style.width = `${TERMINAL_WIDTH * scale}px`;
    canvas.style.height = `${TERMINAL_HEIGHT * scale}px`;
    canvas.style.imageRendering = 'pixelated'; // 픽셀 아트 스타일
    
    // 디버깅: Canvas 크기 출력
    console.log(`터미널 해상도: ${TERMINAL_WIDTH} x ${TERMINAL_HEIGHT}, 스케일: ${scale.toFixed(2)}`);
}

/**
 * 색상 설정
 */
function setColor(r, g, b) {
    current_color = { r, g, b };
    if (ctx) {
        ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    }
}

/**
 * 화면 지우기
 */
function clearScreen() {
    if (!ctx || !canvas) return;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * 선 그리기
 */
function drawLine(x1, y1, x2, y2) {
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

/**
 * 원 그리기
 */
function drawCircle(x, y, radius) {
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
}

/**
 * 채워진 원 그리기
 */
function fillCircle(x, y, radius) {
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * 사각형 그리기
 */
function drawRectangle(x, y, width, height) {
    if (!ctx) return;
    ctx.strokeRect(x, y, width, height);
}

/**
 * 채워진 사각형 그리기
 */
function fillRectangle(x, y, width, height) {
    if (!ctx) return;
    ctx.fillRect(x, y, width, height);
}

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('graphics_canvas');
    if (!canvas) {
        console.error('graphics_canvas를 찾을 수 없습니다.');
        return;
    }
    ctx = canvas.getContext('2d');
    
    // 초기화
    window.addEventListener('resize', initCanvas);
    initCanvas();
    clearScreen();
    setColor(255, 255, 255);
    
    // 전역으로 내보내기
    window.graphics = {
        setColor,
        clearScreen,
        drawLine,
        drawCircle,
        fillCircle,
        drawRectangle,
        fillRectangle,
        canvas,
        ctx
    };
});

