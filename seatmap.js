import { activeHands } from "./submit.hand.js"; // Vercel上ではimport方法に注意

document.addEventListener('DOMContentLoaded', () => {
  const seats = document.querySelectorAll('.seat');
  const modal = document.getElementById('questionModal');
  const modalStudent = document.getElementById('modal-student-id');
  const modalText = document.getElementById('modal-question-text');

  // モーダル内の「対応済み」ボタンを1つだけ作成
  let resolveButton = document.createElement('button');
  resolveButton.textContent = "対応済み";
  resolveButton.style.marginTop = "15px";
  resolveButton.style.padding = "5px 10px";
  resolveButton.style.background = "#28a745";
  resolveButton.style.color = "white";
  resolveButton.style.border = "none";
  resolveButton.style.borderRadius = "5px";
  resolveButton.style.cursor = "pointer";
  modal.querySelector('.modal-content').appendChild(resolveButton);

  // 座席をチェックしてハイライト
  function refreshSeats() {
    seats.forEach(seat => {
      const id = seat.dataset.studentid;
      if (activeHands[id]) {
        seat.classList.add('highlighted');
        seat.innerHTML = `${id}<div class="seat-label">🚨 挙手中</div>`;
      } else {
        seat.classList.remove('highlighted');
        seat.innerHTML = id;
      }
    });
  }

  // 座席クリックイベント
  seats.forEach(seat => {
    seat.addEventListener('click', () => {
      const id = seat.dataset.studentid;
      if (!activeHands[id]) return; // 挙手中でなければ無視

      modalStudent.textContent = id;
      modalText.textContent = activeHands[id];
      modal.style.display = "flex";

      // 「対応済み」ボタンの動作
      resolveButton.onclick = () => {
        delete activeHands[id]; // データ削除
        refreshSeats();         // 座席の表示更新
        modal.style.display = "none";
      };
    });
  });

  // モーダル閉じる
  modal.addEventListener('click', e => {
    if (e.target.id === 'questionModal') modal.style.display = 'none';
  });

  // 初回表示時に挙手中の席をハイライト
  refreshSeats();
});
