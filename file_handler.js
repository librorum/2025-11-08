// DOM 요소 참조
const save_btn = document.getElementById('save_btn');
const open_btn = document.getElementById('open_btn');
const file_input = document.getElementById('file_input');
const example_select = document.getElementById('example_select');
// editor는 전역 변수로 사용

/**
 * 파일 저장
 */
function saveFile() {
    const content = window.editor.value;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'program.bas';
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * 파일 열기
 */
function openFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        window.editor.value = e.target.result;
        // 에디터 업데이트를 위해 이벤트 트리거
        window.editor.dispatchEvent(new Event('input'));
    };
    reader.readAsText(file);
}

/**
 * 예제 코드 불러오기
 */
function loadExample() {
    const selected_value = example_select.value;
    if (!selected_value) return;
    
    if (window.examples && window.examples[selected_value]) {
        window.editor.value = window.examples[selected_value];
        window.editor.dispatchEvent(new Event('input'));
    }
}

// 이벤트 리스너
save_btn.addEventListener('click', saveFile);
open_btn.addEventListener('click', () => file_input.click());
file_input.addEventListener('change', openFile);
example_select.addEventListener('change', loadExample);

