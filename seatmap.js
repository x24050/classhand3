document.addEventListener('DOMContentLoaded', () => {

  async function loadActiveHands() {
    try {
      const res = await fetch('/api/raise-hand');
      const activeHands = await res.json();

      activeHands.forEach(h => {
        const seat = document.querySelector(`.seat[data-studentid="${h.studentId}"]`);
        if (seat) highlightSeat(seat, h.studentId, h.question);
      });
    } catch (err) {
      console.error("挙手データ取得エラー:", err);
    }
  }

  function highlightSeat(seatElement, studentId, question) {
    seatElement.classList.add('highlighted');
    const existingContent = seatElement.textContent.trim();
    seatElement.innerHTML = `${existingContent}<div class="seat-label">🚨 挙手中</div>`;

    seatElement.addEventListener('click', () => {
      const modal = document.getElementById('questionModal');
      document.getElementById('modal-student-id').textContent = studentId;
      document.getElementById('modal-question-text').textContent = question;

      // 対応済みボタンを作成
      let btn = document.getElementById('resolve-button');
      if (!btn) {
        btn = document.createElement('button');
        btn.id = 'resolve-button';
        btn.textContent = '対応済み';
        btn.style.marginTop = '15px';
        btn.style.padding = '8px 12px';
        btn.style.backgroundColor = '#1a73e8';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        document.querySelector('.modal-content').appendChild(btn);
      }

      btn.onclick = async () => {
        try {
          await fetch('/api/raise-hand', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId })
          });
          seatElement.classList.remove('highlighted');
          seatElement.querySelector('.seat-label')?.remove();
          modal.style.display = 'none';
        } catch (err) {
          console.error("対応済みエラー:", err);
        }
      };

      modal.style.display = 'flex';
    });

    seatElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // モーダルを閉じる処理
  document.getElementById('questionModal').addEventListener('click', (e) => {
    if (e.target.id === 'questionModal') e.target.style.display = 'none';
  });

  loadActiveHands();
});
