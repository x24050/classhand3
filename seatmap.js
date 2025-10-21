// public/seatmap.js

document.addEventListener('DOMContentLoaded', async () => {
  const seats = document.querySelectorAll('.seat');
  const modal = document.getElementById('questionModal');
  const modalStudentId = document.getElementById('modal-student-id');
  const modalQuestion = document.getElementById('modal-question-text');

  // 挙手データを取得
  let handData = {};
  try {
    const res = await fetch('/api/hand-data');
    handData = await res.json();
  } catch (err) {
    console.error("hand-data取得失敗:", err);
  }

  // 座席ごとに反映
  seats.forEach(seat => {
    const sid = seat.dataset.studentid;
    if (handData[sid] && !handData[sid].resolved) {
      seat.classList.add('highlighted');
      seat.innerHTML = `${seat.textContent}<div class="seat-label">🚨 挙手中</div>`;
    }

    // クリックで質問表示＋対応済みボタン
    seat.addEventListener('click', () => {
      if (!handData[sid]) return;
      modalStudentId.textContent = sid;
      modalQuestion.textContent = handData[sid].question;

      // 「対応済み」ボタンを追加
      if (!document.getElementById('resolveButton')) {
        const btn = document.createElement('button');
        btn.id = 'resolveButton';
        btn.textContent = '対応済み';
        btn.style.marginTop = '10px';
        btn.onclick = () => {
          handData[sid].resolved = true;
          seat.classList.remove('highlighted');
          seat.querySelector('.seat-label')?.remove();
          modal.style.display = 'none';
        };
        modal.querySelector('.modal-content').appendChild(btn);
      }
      modal.style.display = 'flex';
    });
  });

  // モーダル閉じる処理
  modal.addEventListener('click', e => {
    if (e.target.id === 'questionModal') modal.style.display = 'none';
  });
});
