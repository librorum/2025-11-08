// DOM 요소 참조 (전역 변수로 선언)
let line_numbers, status_text;

/**
 * 라인 번호 업데이트
 */
function updateLineNumbers() {
    const lines = window.editor.value.split('\n');
    const line_count = lines.length;
    line_numbers.innerHTML = '';
    
    for (let i = 1; i <= line_count; i++) {
        const line_num = document.createElement('div');
        line_num.textContent = i;
        line_numbers.appendChild(line_num);
    }
    
    // 스크롤 동기화
    line_numbers.scrollTop = window.editor.scrollTop;
}

/**
 * 상태바 업데이트 (행/열 위치, 문자열 길이, 커서 위치)
 */
function updateStatus() {
    const code = window.editor.value;
    const text_before_cursor = code.substring(0, window.editor.selectionStart);
    const lines = text_before_cursor.split('\n');
    const row = lines.length;
    const col = lines[lines.length - 1].length + 1;
    const cursor_pos = window.editor.selectionStart;
    const code_length = code.length;
    
    status_text.textContent = `행: ${row}, 열: ${col} | 길이: ${code_length} | 커서: ${cursor_pos}`;
}

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.editor = document.getElementById('editor');
    line_numbers = document.getElementById('line_numbers');
    status_text = document.getElementById('status_text');
    
    if (!window.editor || !line_numbers || !status_text) {
        console.error('에디터 DOM 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 에디터 이벤트 리스너
    window.editor.addEventListener('input', () => {
        updateLineNumbers();
        updateStatus();
    });
    
    window.editor.addEventListener('keyup', updateStatus);
    window.editor.addEventListener('click', updateStatus);
    window.editor.addEventListener('scroll', () => {
        line_numbers.scrollTop = window.editor.scrollTop;
    });
    
    // 초기화
    updateLineNumbers();
    updateStatus();
});

