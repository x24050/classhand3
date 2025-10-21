document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('questionModal');
  const modalStudent = document.getElementById('modal-student-id');
  const modalQuestion = document.getElementById('modal-question-text');
  const resolveBtn = document.getElementById('resolveBtn');

  // 座席ごとに挙手を反映する
  async function fetchHands() {
    const res = await fetch('/api/get-hands');
    const hands = await res.json();

    document.querySelectorAll('.seat').forEach(seat => {
      const studentId = seat.dataset.studentid;
      const hand = hands.find(h => h.studentId === studentId && !h.resolved);

      if (hand) {
        seat.classList.add('highlighted');
        seat.innerHTML = `${studentId}<div class="seat-label">🚨 挙手中</div>`;
        seat.onclick = () => showPopup(hand);
      } else {
        seat.classList.remove('highlighted');
        seat.innerHTML = `${studentId}`;
        seat.onclick = null;
      }
    });
  }

  function showPopup(hand) {
    modalStudent.textContent = hand.studentId;
    modalQuestion.textContent = hand.question;
    modal.style.display = 'flex';

    resolveBtn.onclick = async () => {
      await fetch('/api/resolve-hand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: hand.studentId })
      });
      modal.style.display = 'none';
      fetchHands();
    };
  }

  // 背景クリックで閉じる
  modal.addEventListener('click', e => {
    if (e.target.id === 'questionModal') modal.style.display = 'none';
  });

  fetchHands();
  setInterval(fetchHands, 5000); // 5秒ごとに更新
});
