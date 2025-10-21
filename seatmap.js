// public/seatmap.js

document.addEventListener('DOMContentLoaded', async () => {
    const seatMap = document.getElementById('seatMap');

    // --- 1. 挙手データを API から取得 ---
    let handData = {};
    try {
        const response = await fetch('/api/hand-data');
        if (response.ok) {
            handData = await response.json(); // { studentId: question, ... }
        } else {
            console.error("hand-data API error:", await response.text());
        }
    } catch (err) {
        console.error("Exception fetching hand data:", err);
    }

    // --- 2. すべての座席を走査し、挙手があればハイライト ---
    document.querySelectorAll('.seat[data-studentid]').forEach(seat => {
        const studentId = seat.dataset.studentid;
        const question = handData[studentId];
        if (question) {
            highlightSeat(seat, studentId, question);
        }
    });

    // --- 3. 座席のハイライト関数 ---
    function highlightSeat(seatElement, studentId, questionText) {
        seatElement.classList.add('highlighted');
        seatElement.innerHTML = `${studentId}<div class="seat-label">🚨 挙手中</div>`;

        seatElement.addEventListener('click', () => {
            const modal = document.getElementById('questionModal');
            document.getElementById('modal-student-id').textContent = studentId;
            document.getElementById('modal-question-text').textContent = questionText;

            // 「対応済み」ボタンを作成
            let handledBtn = document.getElementById('handled-button');
            if (!handledBtn) {
                handledBtn = document.createElement('button');
                handledBtn.id = 'handled-button';
                handledBtn.textContent = '対応済み';
                handledBtn.style.marginTop = '10px';
                handledBtn.addEventListener('click', async () => {
                    // 解除APIに送信
                    try {
                        const resp = await fetch('/api/hand-data', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ studentId }),
                        });
                        if (resp.ok) {
                            seatElement.classList.remove('highlighted');
                            seatElement.innerHTML = studentId; // ラベル削除
                            modal.style.display = 'none';
                        }
                    } catch (err) {
                        console.error("Failed to clear hand:", err);
                    }
                });
                document.querySelector('.modal-content').appendChild(handledBtn);
            }

            modal.style.display = 'flex';
        });
    }

    // --- 4. モーダル背景クリックで閉じる ---
    document.getElementById('questionModal').addEventListener('click', e => {
        if (e.target.id === 'questionModal') e.target.style.display = 'none';
    });
});
