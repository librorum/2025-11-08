// 실행 상태
let is_running = false;
let should_stop = false;
let current_mode = 'TEXT'; // TEXT or GRAPHICS

// 변수 저장소
const variables = {};

// 출력 버퍼
let console_output = '';
let text_mode_output = '';

// DOM 요소 참조 (DOMContentLoaded에서 초기화)
let console_element, text_mode_display, graphics_canvas, run_btn, mode_btn;

/**
 * 토큰화 (문자열 및 함수 호출 처리 개선)
 */
function tokenize(code) {
    const tokens = [];
    const lines = code.split('\n');
    
    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('REM')) continue;
        
        // 문자열을 보존하면서 토큰화
        const line_tokens = [];
        let i = 0;
        let in_string = false;
        let current_token = '';
        
        while (i < line.length) {
            const char = line[i];
            
            if (char === '"') {
                if (in_string) {
                    current_token += char;
                    line_tokens.push(current_token);
                    current_token = '';
                    in_string = false;
                } else {
                    if (current_token.trim()) {
                        // 함수 호출 처리 (예: SIN(angle))
                        const func_match = current_token.trim().match(/^([A-Z]+)\($/);
                        if (func_match && i + 1 < line.length) {
                            // 함수 이름과 괄호를 하나의 토큰으로
                            let func_token = current_token.trim();
                            let paren_count = 1;
                            let j = i + 1;
                            while (j < line.length && paren_count > 0) {
                                if (line[j] === '(') paren_count++;
                                else if (line[j] === ')') paren_count--;
                                func_token += line[j];
                                j++;
                            }
                            line_tokens.push(func_token);
                            i = j - 1;
                            current_token = '';
                        } else {
                            line_tokens.push(...current_token.trim().split(/\s+/));
                        }
                    }
                    current_token = char;
                    in_string = true;
                }
            } else if (in_string) {
                current_token += char;
            } else if (char === ' ' || char === '\t') {
                if (current_token.trim()) {
                    line_tokens.push(...current_token.trim().split(/\s+/).filter(t => t.trim()));
                    current_token = '';
                }
            } else {
                current_token += char;
            }
            i++;
        }
        
        if (current_token.trim()) {
            if (in_string) {
                line_tokens.push(current_token);
            } else {
                // 함수 호출 확인
                const func_match = current_token.trim().match(/^([A-Z]+)\(.+\)$/);
                if (func_match) {
                    line_tokens.push(current_token.trim());
                } else {
                    line_tokens.push(...current_token.trim().split(/\s+/).filter(t => t.trim()));
                }
            }
        }
        
        tokens.push(line_tokens);
    }
    
    return tokens;
}

/**
 * 숫자 또는 변수 값 가져오기
 */
function getValue(token) {
    if (!isNaN(token)) {
        return parseFloat(token);
    }
    return variables[token] || 0;
}

/**
 * 수학 함수 처리
 */
function evaluateFunction(func_name, arg) {
    const func = func_name.toUpperCase();
    const value = getValue(arg);
    
    switch (func) {
        case 'SIN':
            return Math.sin(value);
        case 'COS':
            return Math.cos(value);
        case 'TAN':
            return Math.tan(value);
        case 'ABS':
            return Math.abs(value);
        case 'SQRT':
            return Math.sqrt(value);
        default:
            return value;
    }
}

/**
 * 표현식 평가 (간단한 산술 연산 및 함수)
 */
function evaluateExpression(tokens, start_idx = 0) {
    if (start_idx >= tokens.length) return 0;
    
    let token = tokens[start_idx];
    let result = 0;
    
    // 함수 호출 처리 (예: SIN(x))
    if (token.match(/^[A-Z]+$/)) {
        const func_match = token.match(/^([A-Z]+)\((.+)\)$/);
        if (func_match) {
            result = evaluateFunction(func_match[1], func_match[2]);
        } else {
            result = getValue(token);
        }
    } else {
        result = getValue(token);
    }
    
    let i = start_idx + 1;
    
    while (i < tokens.length) {
        const op = tokens[i];
        if (op === '+' || op === '-' || op === '*' || op === '/') {
            let next_token = tokens[i + 1];
            let next_val = 0;
            
            // 다음 토큰이 함수인지 확인
            if (next_token && next_token.match(/^[A-Z]+$/)) {
                const func_match = next_token.match(/^([A-Z]+)\((.+)\)$/);
                if (func_match) {
                    next_val = evaluateFunction(func_match[1], func_match[2]);
                } else {
                    next_val = getValue(next_token);
                }
            } else {
                next_val = getValue(next_token);
            }
            
            if (op === '+') result += next_val;
            else if (op === '-') result -= next_val;
            else if (op === '*') result *= next_val;
            else if (op === '/') result /= next_val;
            i += 2;
        } else {
            break;
        }
    }
    
    return result;
}

/**
 * PRINT 명령어 처리
 */
function handlePrint(tokens) {
    let output = '';
    let i = 1;
    
    while (i < tokens.length) {
        if (tokens[i].startsWith('"')) {
            // 문자열 처리
            let str = tokens[i];
            if (str.endsWith('"') && str.length > 1) {
                output += str.slice(1, -1);
            } else {
                // 여러 토큰에 걸친 문자열
                while (i + 1 < tokens.length && !tokens[i + 1].endsWith('"')) {
                    str += ' ' + tokens[++i];
                }
                if (i + 1 < tokens.length) {
                    str += ' ' + tokens[++i];
                    output += str.slice(1, -1);
                }
            }
        } else {
            // 변수 또는 표현식
            const value = evaluateExpression(tokens, i);
            output += value;
            break;
        }
        i++;
    }
    
    if (current_mode === 'TEXT') {
        text_mode_output += output + '\n';
    } else {
        console_output += output + '\n';
    }
}

/**
 * 변수 할당 처리
 */
function handleAssignment(tokens) {
    const var_name = tokens[0];
    let value = 0;
    
    if (tokens.length >= 3 && tokens[1] === '=') {
        // 함수 호출 확인 (예: sin_val = SIN(angle))
        if (tokens.length >= 4 && tokens[2].match(/^[A-Z]+$/)) {
            const func_match = tokens[2].match(/^([A-Z]+)\((.+)\)$/);
            if (func_match) {
                value = evaluateFunction(func_match[1], func_match[2]);
            } else {
                value = evaluateExpression(tokens, 2);
            }
        } else {
            value = evaluateExpression(tokens, 2);
        }
    } else if (tokens.length >= 2) {
        value = getValue(tokens[1]);
    }
    
    variables[var_name] = value;
}

/**
 * LINE 명령어 처리
 */
function handleLine(tokens) {
    if (tokens.length < 5) return;
    const x1 = getValue(tokens[1]);
    const y1 = getValue(tokens[2]);
    const x2 = getValue(tokens[3]);
    const y2 = getValue(tokens[4]);
    window.graphics.drawLine(x1, y1, x2, y2);
}

/**
 * CIRCLE 명령어 처리
 */
function handleCircle(tokens) {
    if (tokens.length < 4) return;
    const x = getValue(tokens[1]);
    const y = getValue(tokens[2]);
    const radius = getValue(tokens[3]);
    window.graphics.drawCircle(x, y, radius);
}

/**
 * RECTANGLE 명령어 처리
 */
function handleRectangle(tokens) {
    if (tokens.length < 5) return;
    const x = getValue(tokens[1]);
    const y = getValue(tokens[2]);
    const width = getValue(tokens[3]);
    const height = getValue(tokens[4]);
    window.graphics.drawRectangle(x, y, width, height);
}

/**
 * COLOR 명령어 처리
 */
function handleColor(tokens) {
    if (tokens.length < 4) return;
    const r = getValue(tokens[1]);
    const g = getValue(tokens[2]);
    const b = getValue(tokens[3]);
    window.graphics.setColor(r, g, b);
}

/**
 * CLEAR 명령어 처리
 */
function handleClear() {
    window.graphics.clearScreen();
}

/**
 * FOR 루프 처리 (비동기 애니메이션 지원)
 */
async function handleFor(tokens, all_tokens, current_idx) {
    const var_name = tokens[1];
    const start_val = getValue(tokens[3]);
    const end_val = getValue(tokens[5]);
    
    variables[var_name] = start_val;
    
    let loop_start = current_idx;
    let loop_end = all_tokens.length;
    
    // NEXT 찾기
    for (let i = current_idx + 1; i < all_tokens.length; i++) {
        if (all_tokens[i][0] === 'NEXT' && all_tokens[i][1] === var_name) {
            loop_end = i;
            break;
        }
    }
    
    while (variables[var_name] <= end_val && !should_stop) {
        // 루프 내부 실행
        for (let i = loop_start + 1; i < loop_end; i++) {
            if (should_stop) break;
            const result = await executeLine(all_tokens[i], all_tokens, i);
            if (result !== i) {
                i = result - 1;
                continue;
            }
        }
        
        // 화면 업데이트를 위한 지연 (애니메이션 효과)
        await new Promise(resolve => setTimeout(resolve, 16)); // 약 60fps
        
        variables[var_name]++;
    }
    
    return loop_end;
}

/**
 * IF 조건문 처리
 */
function handleIf(tokens, all_tokens, current_idx) {
    // 간단한 IF THEN 구현
    let condition_idx = 1;
    let then_idx = -1;
    
    // THEN 찾기
    for (let i = 1; i < tokens.length; i++) {
        if (tokens[i] === 'THEN') {
            then_idx = i;
            break;
        }
    }
    
    if (then_idx === -1) return current_idx;
    
    // 조건 평가 (간단한 비교만)
    const left = getValue(tokens[condition_idx]);
    const op = tokens[condition_idx + 1];
    const right = getValue(tokens[condition_idx + 2]);
    
    let condition_met = false;
    if (op === '>') condition_met = left > right;
    else if (op === '<') condition_met = left < right;
    else if (op === '=' || op === '==') condition_met = left === right;
    else if (op === '>=') condition_met = left >= right;
    else if (op === '<=') condition_met = left <= right;
    
    if (condition_met) {
        // THEN 이후 명령어 실행
        const then_tokens = tokens.slice(then_idx + 1);
        if (then_tokens.length > 0) {
            executeLine(then_tokens, all_tokens, current_idx);
        }
    }
    
    return current_idx;
}

/**
 * 한 줄 실행
 */
async function executeLine(tokens, all_tokens, current_idx) {
    if (!tokens || tokens.length === 0) return current_idx;
    
    const command = tokens[0].toUpperCase();
    
    switch (command) {
        case 'PRINT':
            handlePrint(tokens);
            break;
        case 'LINE':
            handleLine(tokens);
            break;
        case 'CIRCLE':
            handleCircle(tokens);
            break;
        case 'RECTANGLE':
            handleRectangle(tokens);
            break;
        case 'COLOR':
            handleColor(tokens);
            break;
        case 'CLEAR':
            handleClear();
            break;
        case 'GRAPHICS':
            if (tokens.length > 1 && tokens[1].toUpperCase() === 'MODE') {
                current_mode = 'GRAPHICS';
                graphics_canvas.classList.remove('hidden');
                text_mode_display.classList.add('hidden');
                if (mode_btn) mode_btn.textContent = '그래픽 모드';
            }
            break;
        case 'TEXT':
            if (tokens.length > 1 && tokens[1].toUpperCase() === 'MODE') {
                current_mode = 'TEXT';
                graphics_canvas.classList.add('hidden');
                text_mode_display.classList.remove('hidden');
                if (mode_btn) mode_btn.textContent = '텍스트 모드';
            }
            break;
        case 'FOR':
            return await handleFor(tokens, all_tokens, current_idx);
        case 'IF':
            return handleIf(tokens, all_tokens, current_idx);
        case 'NEXT':
        case 'END':
        case 'REM':
            // 무시
            break;
        default:
            // 변수 할당으로 간주
            if (tokens.length >= 2 && tokens[1] === '=') {
                handleAssignment(tokens);
            }
            break;
    }
    
    return current_idx;
}

/**
 * 코드 실행 또는 중지
 */
async function toggleRunStop() {
    console.log('실행 버튼 클릭됨!');
    console.log('현재 실행 상태:', is_running);
    
    if (is_running) {
        // 실행 중이면 중지
        console.log('실행 중지 요청');
        should_stop = true;
    } else {
        // 실행 중이 아니면 실행
        console.log('코드 실행 시작');
        await runCode();
    }
}

/**
 * 코드 실행
 */
async function runCode() {
    console.log('runCode 함수 호출됨');
    console.log('is_running:', is_running);
    
    if (is_running) {
        console.log('이미 실행 중이므로 리턴');
        return;
    }
    
    // DOM 요소 확인
    console.log('DOM 요소 확인:', {
        console_element,
        text_mode_display,
        window_editor: window.editor
    });
    
    // window.editor가 없으면 직접 가져오기
    if (!window.editor) {
        window.editor = document.getElementById('editor');
        console.log('window.editor 직접 가져옴:', window.editor);
    }
    
    if (!console_element || !text_mode_display || !window.editor) {
        console.error('필수 DOM 요소가 없습니다.');
        return;
    }
    
    is_running = true;
    should_stop = false;
    
    // 버튼 상태 변경 (실행 중)
    run_btn.classList.add('running');
    run_btn.querySelector('.btn_text').textContent = '정지';
    run_btn.disabled = false;
    
    // 초기화
    Object.keys(variables).forEach(key => delete variables[key]);
    console_output = '';
    text_mode_output = '';
    console_element.textContent = '';
    text_mode_display.textContent = '';
    
    const code = window.editor.value;
    console.log('코드 확인:', code);
    console.log('코드 길이:', code ? code.length : 0);
    console.log('trim 후:', code ? code.trim() : '');
    console.log('비어있는지:', !code || code.trim() === '');
    
    if (!code || code.trim() === '') {
        // 경고 메시지 출력
        const warning_msg = '코드가 비어 있습니다.\n';
        console.log('경고 메시지 출력:', warning_msg);
        console_output = warning_msg;
        text_mode_output = warning_msg;
        
        // 현재 모드에 따라 출력
        if (current_mode === 'TEXT') {
            text_mode_display.textContent = text_mode_output;
            console.log('텍스트 모드에 출력:', text_mode_display);
        } else {
            console_element.textContent = console_output;
            console.log('콘솔에 출력:', console_element);
        }
        
        is_running = false;
        run_btn.classList.remove('running');
        run_btn.querySelector('.btn_text').textContent = '실행';
        return;
    }
    
    const tokens = tokenize(code);
    
    try {
        for (let i = 0; i < tokens.length; i++) {
            if (should_stop) break;
            
            i = await executeLine(tokens[i], tokens, i);
            
            // 출력 업데이트
            if (current_mode === 'TEXT') {
                text_mode_display.textContent = text_mode_output;
            } else {
                console_element.textContent = console_output;
            }
            
            // 비동기 처리로 UI 업데이트
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    } catch (error) {
        console_output += `에러: ${error.message}\n`;
        console_element.textContent = console_output;
        console.error('실행 에러:', error);
    }
    
    is_running = false;
    
    // 버튼 상태 변경 (실행 전)
    run_btn.classList.remove('running');
    run_btn.querySelector('.btn_text').textContent = '실행';
}

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded 실행됨');
    
    // DOM 요소 초기화
    console_element = document.getElementById('console_output');
    text_mode_display = document.getElementById('text_mode_display');
    graphics_canvas = document.getElementById('graphics_canvas');
    run_btn = document.getElementById('run_btn');
    mode_btn = document.getElementById('mode_btn');
    
    console.log('DOM 요소 확인:', {
        console_element,
        text_mode_display,
        graphics_canvas,
        run_btn,
        mode_btn
    });
    
    // DOM 요소 확인
    if (!console_element || !text_mode_display || !graphics_canvas || 
        !run_btn || !mode_btn) {
        console.error('필수 DOM 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 초기 모드 설정 (TEXT 모드)
    graphics_canvas.classList.add('hidden');
    text_mode_display.classList.remove('hidden');
    mode_btn.textContent = '텍스트 모드';
    mode_btn.disabled = true; // 읽기 전용으로 설정
    
    // 시작 메시지 표시
    text_mode_display.textContent = 'Welcome to CodingPen\n\nBASIC Interpreter Ready.\nType your code and press RUN.\n';
    
    // 이벤트 리스너
    console.log('이벤트 리스너 연결 시도');
    run_btn.addEventListener('click', toggleRunStop);
    console.log('이벤트 리스너 연결 완료');
});
