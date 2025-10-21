// public/seatmap.js
document.addEventListener('DOMContentLoaded', () => {
    const activeQuestions = []; // メモリ上で挙手情報を保持

    const urlParams = new URLSearchParams(window.location.search);
    const studentIdFull = urlParams.get('studentId');
    const question = urlParams.get('question');

    if (studentIdFull && question) {
        addQuestion(studentIdFull, question);
    }

    function addQuestion(studentId, questionText) {
        const seatElement = document.querySelector(`.seat[data-studentid="${studentId}"]`);
        if (!seatElement) return console.log(`学籍番号 ${studentId} に対応する座席が見つかりません`);

        if (!activeQuestions.find(q => q.studentId === studentId)) {
            activeQuestions.push({ studentId, question: questionText });
        }

        highlightSeat(seatElement, studentId, questionText);
    }

    function highlightSeat(seatElement, studentId, questionText) {
        seatElement.classList.add('highlighted');
        const existingContent = seatElement.textContent.trim();
        seatElement.innerHTML = `${existingContent}<div class="seat-label">🚨 挙手中</div>`;

        seatElement.onclick = () => {
            document.getElementById('modal-student-id').textContent = studentId;
            document.getElementById('modal-question-text').textContent = questionText;
            document.getElementById('questionModal').style.display = 'flex';
        };

        seatElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const resolveButton = document.getElementById('resolveButton');
    resolveButton.addEventListener('click', () => {
        const modalStudentId = document.getElementById('modal-student-id').textContent;
        const seat = document.querySelector(`.seat[data-studentid="${modalStudentId}"]`);
        if (seat) {
            seat.classList.remove('highlighted');
            const text = seat.textContent.replace('🚨 挙手中', '');
            seat.textContent = text;
        }
        // メモリから削除
        const idx = activeQuestions.findIndex(q => q.studentId === modalStudentId);
        if (idx !== -1) activeQuestions.splice(idx, 1);

        document.getElementById('questionModal').style.display = 'none';
    });

    // モーダルの背景クリックで閉じる
    document.getElementById('questionModal').addEventListener('click', e => {
        if (e.target.id === 'questionModal') e.target.style.display = 'none';
    });
});
