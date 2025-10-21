// public/seatmap.js

// メモリ上で挙手データを管理
const activeHands = [];

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const studentIdFull = urlParams.get('studentId');
  const question = urlParams.get('question');

  if (studentIdFull && question) {
    addOrUpdateHand(studentIdFull, question);
  }

  renderSeats();
  setupModal();
});

/**
 * 挙手データを追加・更新
 */
function addOrUpdateHand(studentId, question) {
  const existingIndex = activeHands.findIndex(h => h.studentId === studentId);
  if (existingIndex >= 0) {
    activeHands[existingIndex].question = question; // 上書き
  } else {
    activeHands.push({ studentId, question });
  }
}

/**
 * 座席表をレンダリング
 */
function renderSeats() {
  const seats = document.querySelectorAll('.seat');
  seats.forEach(seat => {
    const studentId = seat.dataset.studentid;

    // 既存のクリックイベントを解除して再設定
    const newSeat = seat.cloneNode(true);
    seat.replaceWith(newSeat);

    // 挙手中かどうかチェック
    const hand = activeHands.find(h => h.studentId === studentId);
    if (hand) {
      highlightSeat(newSeat, hand.studentId, hand.question);
    } else {
      newSeat.classList.remove('highlighted');
      // ラベルを削除して元に戻す
      const label = newSeat.querySelector('.seat-label');
      if (label) label.remove();
    }
  });

  renderQuestionList();
}

/**
 * 座席のハイライトとクリック設定
 */
function highlightSeat(seatElement, studentId, question) {
  seatElement.classList.add('highlighted');

  // 既存の学籍番号を中央に保持
  const existingContent = seatElement.textContent.trim();
  seatElement.innerHTML = `${existingContent}<div class="seat-label">🚨 挙手中</div>`;

  // クリックでモーダル表示
  seatElement.addEventListener('click', () => {
    showModal(studentId, question);
  });
}

/**
 * モーダル初期設定
 */
function setupModal() {
  const modal = document.getElementById('questionModal');
  const closeBtn = modal.querySelector('.close-button');
  const resolveBtn = modal.querySelector('#resolve-button');

  // モーダル閉じる
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  modal.addEventListener('click', e => {
    if (e.target.id === 'questionModal') modal.style.display = 'none';
  });

  // 解決済みボタン初期化
  if (!resolveBtn) {
    const btn = document.createElement('button');
    btn.id = 'resolve-button';
    btn.textContent = '対応済み';
    btn.style.display = 'none';
    modal.querySelector('.modal-content').appendChild(btn);
  }
}

/**
 * モーダル表示
 */
function showModal(studentId, question) {
  const modal = document.getElementById('questionModal');
  document.getElementById('modal-student-id').textContent = studentId;
  document.getElementById('modal-question-text').textContent = question;
  modal.style.display = 'flex';

  const resolveBtn = document.getElementById('resolve-button');
  resolveBtn.style.display = 'inline-block';

  resolveBtn.onclick = () => {
    // 挙手データから削除
    const index = activeHands.findIndex(h => h.studentId === studentId);
    if (index >= 0) activeHands.splice(index, 1);

    // 座席のハイライト解除
    const seat = document.querySelector(`.seat[data-studentid="${studentId}"]`);
    if (seat) {
      seat.classList.remove('highlighted');
      const label = seat.querySelector('.seat-label');
      if (label) label.remove();

      // クリックイベントを解除
      const newSeat = seat.cloneNode(true);
      seat.replaceWith(newSeat);
    }

    // モーダル閉じる
    modal.style.display = 'none';

    // 質問リスト更新
    renderQuestionList();
  };
}

/**
 * 画面右側の質問リストをレンダリング
 */
function renderQuestionList() {
  let container = document.querySelector('#activeQuestionsList');
  if (!container) {
    // まだない場合は作成
    container = document.createElement('ul');
    container.id = 'activeQuestionsList';
    const wrapper = document.querySelector('.question-list-container');
    if (!wrapper) {
      const questionWrapper = document.createElement('div');
      questionWrapper.className = 'question-list-container';
      questionWrapper.innerHTML = '<h4>挙手中の質問</h4>';
      questionWrapper.appendChild(container);
      document.querySelector('.container').appendChild(questionWrapper);
    } else {
      wrapper.appendChild(container);
    }
  }

  // 既存のリストをクリア
  container.innerHTML = '';

  if (activeHands.length === 0) {
    const li = document.createElement('li');
    li.className = 'no-questions';
    li.textContent = '現在挙手中の質問はありません';
    container.appendChild(li);
    return;
  }

  activeHands.forEach(hand => {
    const li = document.createElement('li');
    li.className = 'question-item';
    li.textContent = `${hand.studentId}: ${hand.question}`;
    li.addEventListener('click', () => {
      // 座席をクリックしたときと同じ動作でモーダル表示
      showModal(hand.studentId, hand.question);
    });
    container.appendChild(li);
  });
}
