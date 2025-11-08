// 예제 코드 저장소
window.examples = {
    '기본 출력 예제': `PRINT "안녕하세요!"
PRINT "베이직 개발환경에 오신 것을 환영합니다"
PRINT "이것은 텍스트 모드입니다"`,

    '변수 계산 예제': `x = 10
y = 20
sum = x + y
PRINT "x = ", x
PRINT "y = ", y
PRINT "합계 = ", sum`,

    '반복문 예제': `PRINT "1부터 10까지 출력:"
FOR i = 1 TO 10
    PRINT i
NEXT i`,

    '기본 도형 그리기': `GRAPHICS MODE
COLOR 255 255 255
CLEAR
LINE 100 100 540 100
LINE 540 100 540 200
LINE 540 200 100 200
LINE 100 200 100 100
CIRCLE 320 150 50`,

    '색상 변화 예제': `GRAPHICS MODE
CLEAR
COLOR 255 0 0
CIRCLE 160 150 60
COLOR 0 255 0
CIRCLE 320 150 60
COLOR 0 0 255
CIRCLE 480 150 60
COLOR 255 255 0
CIRCLE 240 300 60
COLOR 255 0 255
CIRCLE 400 300 60`,

    '움직이는 원 애니메이션': `GRAPHICS MODE
CLEAR
COLOR 0 255 255
FOR i = 1 TO 150
    CLEAR
    x = 100 + i * 3
    angle = i / 10
    sin_val = SIN(angle)
    y = 240 + 80 * sin_val
    CIRCLE x y 30
NEXT i`,

    '나선 패턴': `GRAPHICS MODE
CLEAR
COLOR 255 255 255
center_x = 320
center_y = 240
FOR i = 1 TO 100
    angle = i * 0.2
    radius = i * 3
    cos_val = COS(angle)
    sin_val = SIN(angle)
    new_x = center_x + radius * cos_val
    new_y = center_y + radius * sin_val
    CIRCLE new_x new_y 6
NEXT i`,

    '별 그리기': `GRAPHICS MODE
CLEAR
COLOR 255 255 0
center_x = 320
center_y = 240
radius = 120
FOR i = 0 TO 4
    angle1 = i * 144 * 3.14159 / 180
    angle2 = (i + 0.5) * 144 * 3.14159 / 180
    cos1 = COS(angle1)
    sin1 = SIN(angle1)
    cos2 = COS(angle2)
    sin2 = SIN(angle2)
    x1 = center_x + radius * cos1
    y1 = center_y + radius * sin1
    x2 = center_x + radius * 0.4 * cos2
    y2 = center_y + radius * 0.4 * sin2
    LINE center_x center_y x1 y1
    LINE center_x center_y x2 y2
NEXT i`,

    '복잡한 그래픽 데모': `GRAPHICS MODE
CLEAR
COLOR 255 0 0
FOR i = 1 TO 30
    x = 50 + i * 18
    y = 50 + i * 10
    CIRCLE x y 25
NEXT i
COLOR 0 255 0
FOR i = 1 TO 25
    x = 580 - i * 18
    y = 150 + i * 12
    RECTANGLE x y 40 40
NEXT i
COLOR 0 0 255
FOR i = 1 TO 20
    x1 = 100
    y1 = 350 + i * 6
    x2 = 540
    y2 = 350 + i * 6
    LINE x1 y1 x2 y2
NEXT i`,

    '인터랙티브 예제': `GRAPHICS MODE
CLEAR
COLOR 255 255 255
FOR i = 1 TO 60
    x = 100 + i * 8
    sin_val = SIN(i)
    y = 200 + 60 * sin_val
    r = 255 - i * 4
    g = 100 + i * 2
    b = 50 + i * 3
    COLOR r g b
    CIRCLE x y 18
NEXT i
COLOR 255 255 255
FOR i = 1 TO 30
    x = 150
    y = 350 + i * 4
    width = 400 - i * 12
    height = 12
    RECTANGLE x y width height
NEXT i`
};

// 예제 메뉴 초기화
document.addEventListener('DOMContentLoaded', () => {
    const example_select = document.getElementById('example_select');
    if (example_select) {
        Object.keys(window.examples).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            example_select.appendChild(option);
        });
    }
});

