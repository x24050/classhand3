// handraise.js

// 挙手フォーム送信処理
document.getElementById("raise-hand-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const classId = document.getElementById("classId").value;
  const studentId = document.getElementById("studentId").value;
  const question = document.getElementById("question").value;

  // Teams Webhook URL（授業ごとに環境変数を使う想定）
  const webhookMap = {
    webp: WEBP_WEBHOOK // ← envから埋め込む（例：Vercelの環境変数）
  };
  const webhookUrl = webhookMap[classId];

  if (!webhookUrl) {
    alert("無効な授業です");
    return;
  }

  // BASE_URLも環境変数から取得
  const baseURL = BASE_URL; // 例: https://your-vercel-app.vercel.app
  if (!baseURL) {
    console.error("BASE_URL環境変数が設定されていません。");
    alert("システムエラー: BASE_URL未設定です。");
    return;
  }

  // 座席表リンク生成
  const encodedQuestion = encodeURIComponent(question);
  const seatmapLink = `${baseURL}/seatmap.html?studentId=${studentId}&question=${encodedQuestion}`;

  // Teamsメッセージ（MessageCard形式）
  const message = {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    "summary": "新しい挙手",
    "themeColor": "DC143C",
    "title": `🔴 挙手通知: ${studentId}`,
    "text": `**学籍番号:** ${studentId}\n**質問:** ${question}`,
    "potentialAction": [
      {
        "@type": "OpenUri",
        "name": "座席表で確認する",
        "targets": [
          { "os": "default", "uri": seatmapLink }
        ]
      }
    ]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });

    if (response.ok) {
      alert("挙手が送信されました！");
      document.getElementById("question").value = "";
    } else {
      alert("送信に失敗しました。");
    }
  } catch (err) {
    console.error("Teams送信エラー:", err);
    alert("エラーが発生しました。");
  }
});
